import { useCallback, useEffect, useRef, useState } from "react";
import { ClapThresholds, DEFAULT_CLAP_THRESHOLDS } from "./useClapDetection";

export type HandTrackingStatus =
  | "idle"
  | "requestingCamera"
  | "loadingModel"
  | "tracking"
  | "permissionDenied"
  | "error";

export interface HandTrackingResult {
  status: HandTrackingStatus;
  handsVisible: number;
  palmDistance: number | null;
  clapEventId: number;
  errorMessage: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const TASKS_VISION_VERSION = "0.10.35";
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VISION_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export function useHandTracking(
  active: boolean,
  thresholds: ClapThresholds = DEFAULT_CLAP_THRESHOLDS
): HandTrackingResult {
  const [status, setStatus] = useState<HandTrackingStatus>("idle");
  const [handsVisible, setHandsVisible] = useState(0);
  const [palmDistance, setPalmDistance] = useState<number | null>(null);
  const [clapEventId, setClapEventId] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<import("@mediapipe/tasks-vision").HandLandmarker | null>(null);
  const lastDetectRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);

  const thresholdsRef = useRef(thresholds);
  useEffect(() => { thresholdsRef.current = thresholds; }, [thresholds]);

  const wasApartRef = useRef(true);
  const lastClapTimeRef = useRef(0);
  const prevDistRef = useRef<number | null>(null);
  const lastTwoHandsTimesRef = useRef(0);
  const wasClosingRef = useRef(false);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
  }, []);

  useEffect(() => {
    if (!active) {
      stop();
      setStatus("idle");
      return;
    }

    let cancelled = false;

    async function start() {
      try {
        setStatus("requestingCamera");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;
        video.muted = true;
        video.playsInline = true;
        video.srcObject = stream;
        await video.play();

        setStatus("loadingModel");
        const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);

        const baseOpts = {
          numHands: 2,
          runningMode: "VIDEO" as const,
          minHandDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        };

        let landmarker;
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
            ...baseOpts,
          });
        } catch {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
            ...baseOpts,
          });
        }
        if (cancelled) { landmarker.close(); return; }
        landmarkerRef.current = landmarker;
        setStatus("tracking");

        const TARGET_INTERVAL = 1000 / 30;

        const loop = () => {
          rafRef.current = requestAnimationFrame(loop);
          const now = performance.now();
          if (now - lastDetectRef.current < TARGET_INTERVAL) return;
          lastDetectRef.current = now;

          const v = videoRef.current;
          const lm = landmarkerRef.current;
          if (!v || !lm || v.readyState < 2) return;

          const result = lm.detectForVideo(v, now);
          const hands = result.landmarks ?? [];
          setHandsVisible(hands.length);

          if (hands.length >= 2) {
            const cA = palmCenter(hands[0]);
            const cB = palmCenter(hands[1]);
            const dx = cA.x - cB.x;
            const dy = cA.y - cB.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            setPalmDistance(dist);

            const t = thresholdsRef.current;
            const prevDist = prevDistRef.current;

            if (dist > t.openThreshold) {
              wasApartRef.current = true;
            }

            const positionClap = dist < t.closeThreshold;
            const velocityClap =
              prevDist !== null &&
              prevDist > t.openThreshold &&
              prevDist - dist > t.approachVelocity;

            if (
              (positionClap || velocityClap) &&
              wasApartRef.current &&
              now - lastClapTimeRef.current > t.debounceMs
            ) {
              wasApartRef.current = false;
              lastClapTimeRef.current = now;
              setClapEventId((id) => id + 1);
            }
            wasClosingRef.current = prevDist !== null && dist < prevDist;
            lastTwoHandsTimesRef.current = now;
            prevDistRef.current = dist;
          } else {
            const MERGE_GRACE_MS = 200;
            if (
              wasClosingRef.current &&
              wasApartRef.current &&
              now - lastTwoHandsTimesRef.current < MERGE_GRACE_MS &&
              now - lastClapTimeRef.current > thresholdsRef.current.debounceMs
            ) {
              wasApartRef.current = false;
              lastClapTimeRef.current = now;
              setClapEventId((id) => id + 1);
            }
            setPalmDistance(null);
            prevDistRef.current = null;
            wasClosingRef.current = false;
          }
        };

        wasApartRef.current = true;
        lastClapTimeRef.current = 0;
        prevDistRef.current = null;
        lastTwoHandsTimesRef.current = 0;
        wasClosingRef.current = false;
        loop();
      } catch (err) {
        if (cancelled) return;

        const name =
          err && typeof err === "object" && "name" in err
            ? (err as { name?: unknown }).name
            : undefined;

        if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
          setStatus("permissionDenied");
          setErrorMessage("Webcam access is required to clap with your hands.");
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          setStatus("error");
          setErrorMessage("No webcam was found on this device.");
        } else {
          setStatus("error");
          setErrorMessage(err instanceof Error ? err.message : "Could not start hand tracking.");
        }
      }
    }

    start();
    return () => { cancelled = true; stop(); };
  }, [active, stop]);

  return { status, handsVisible, palmDistance, clapEventId, errorMessage, videoRef };
}

function palmCenter(landmarks: { x: number; y: number }[]) {
  const wrist = landmarks[0];
  const mcp = landmarks[9];
  return { x: (wrist.x + mcp.x) / 2, y: (wrist.y + mcp.y) / 2 };
}