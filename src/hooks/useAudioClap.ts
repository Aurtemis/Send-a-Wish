import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioClapResult {
  clapEventId: number;
  /** false if mic permission was denied or the API isn't available */
  available: boolean;
  /** true once the mic is open and actively listening */
  listening: boolean;
}

// How many times louder than the rolling background RMS the signal must
// be to count as a clap. Higher = less sensitive (fewer false positives
// from speech/music); lower = more sensitive (catches quiet claps).
// 4.0 works well in a quiet room; raise toward 6.0 in noisy environments.
const SENSITIVITY = 2.0;
const DEBOUNCE_MS = 400;
const CHECK_INTERVAL_MS = 25; // check audio ~40x per second

export function useAudioClap(active: boolean): AudioClapResult {
  const [clapEventId, setClapEventId] = useState(0);
  const [available, setAvailable] = useState(true);
  const [listening, setListening] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastClapRef = useRef(0);
  const lastCheckRef = useRef(0);
  // Slowly-adapting background energy level — self-calibrates to room noise.
  const bgEnergyRef = useRef(0.01);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => {
    if (!active) { stop(); return; }

    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
          video: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) { setAvailable(false); return; }

        const ctx = new Ctor();
        ctxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        // Small fftSize = short time window = catches sharp transients (claps).
        // smoothingTimeConstant 0 = no temporal averaging, maximum responsiveness.
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0;
        source.connect(analyser);

        const buffer = new Float32Array(analyser.fftSize);
        bgEnergyRef.current = 0.01;
        setListening(true);

        const loop = () => {
          rafRef.current = requestAnimationFrame(loop);
          const now = performance.now();
          if (now - lastCheckRef.current < CHECK_INTERVAL_MS) return;
          lastCheckRef.current = now;

          analyser.getFloatTimeDomainData(buffer);

          // RMS energy of this window.
          let sumSq = 0;
          for (let i = 0; i < buffer.length; i++) sumSq += buffer[i] * buffer[i];
          const rms = Math.sqrt(sumSq / buffer.length);

          // Update background: slow rise (adapts to loud rooms over ~3s), even slower fall (so a burst of claps doesn't inflate the baseline
          // and make subsequent claps harder to detect).
          if (rms > bgEnergyRef.current) {
            bgEnergyRef.current = bgEnergyRef.current * 0.97 + rms * 0.03;
          } else {
            bgEnergyRef.current = bgEnergyRef.current * 0.998 + rms * 0.002;
          }

          const ratio = rms / Math.max(bgEnergyRef.current, 0.0001);

          if (ratio > SENSITIVITY && now - lastClapRef.current > DEBOUNCE_MS) {
            lastClapRef.current = now;
            setClapEventId((id) => id + 1);
          }
        };

        loop();
      } catch {
        // Mic permission denied or not available — audio clap won't work,
        // but camera-based detection can still carry the experience.
        if (!cancelled) setAvailable(false);
      }
    }

    start();
    return () => { cancelled = true; stop(); };
  }, [active, stop]);

  return { clapEventId, available, listening };
}