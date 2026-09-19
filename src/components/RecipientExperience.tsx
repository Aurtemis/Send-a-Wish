"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Envelope from "./Envelope";
import WishForm from "./WishForm";
import AudioPlayer from "./AudioPlayer";
import DebugPanel from "./DebugPanel";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useAudioClap } from "@/hooks/useAudioClap";
import { DEFAULT_CLAP_THRESHOLDS, ClapThresholds } from "@/hooks/useClapDetection";
import { useGameState } from "@/hooks/useGameState";
import { unlockAudio, playBlowoutSound } from "@/utils/sfx";
import { WishData } from "@/types";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

interface RecipientExperienceProps {
  wish: WishData;
}

export default function RecipientExperience({ wish }: RecipientExperienceProps) {
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).get("debug") === "1");
  }, []);

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const [thresholds, setThresholds] = useState<ClapThresholds>(DEFAULT_CLAP_THRESHOLDS);
  const tracking = useHandTracking(true, thresholds);
  const isTracking = tracking.status === "tracking";
  const audioClap = useAudioClap(true);
  const combinedClapId = tracking.clapEventId + audioClap.clapEventId; // incremented when either source detects a clap
  const ready = isTracking || audioClap.listening; // either source is ready to detect claps

  const { state, clapCount, clapsNeeded, openEnvelope } = useGameState(
    combinedClapId,
    ready
  );

  const lit = state === "waitingForClaps" || state === "resetting";

  const [blowoutTriggerKey, setBlowoutTriggerKey] = useState(0);
  const [celebrateTriggerKey, setCelebrateTriggerKey] = useState(0);
  const [everOpenedEnvelope, setEverOpenedEnvelope] = useState(false);
  const [wishFormOpen, setWishFormOpen] = useState(false);
  const prevState = useRef(state);

  useEffect(() => {
    if (prevState.current === state) return;
    prevState.current = state;
    if (state === "blowingOut") {
      setBlowoutTriggerKey((k) => k + 1);
      playBlowoutSound();
    }
    if (state === "waitingForEnvelope") setCelebrateTriggerKey((k) => k + 1);
    if (state === "envelopeOpen") setEverOpenedEnvelope(true);
  }, [state]);

  const showHandsMessage =
    isTracking &&
    !audioClap.listening &&
    tracking.handsVisible < 2 &&
    (state === "waitingForClaps" || state === "envelopeOpen");

  const showEnvelope = state === "waitingForEnvelope" || state === "envelopeOpen";
  const musicActive = state === "waitingForEnvelope" || state === "envelopeOpen";

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0e0a08]">
      <Scene
        age={wish.age}
        lit={lit}
        blowoutTriggerKey={blowoutTriggerKey}
        celebrateTriggerKey={celebrateTriggerKey}
      />

      <video
        ref={tracking.videoRef}
        muted
        playsInline
        className="pointer-events-none fixed bottom-4 right-4 z-20 h-28 w-36 rounded-lg object-cover opacity-80 ring-1 ring-[#d4af37]/30"
        style={{ 
          transform: "scaleX(-1)",
          width: "clamp(80px, 22vw, 144px)",
          height: "clamp(60px, 17vw, 112px)",
        }}
      />

      {audioClap.listening && (
      <div
        title="Listening"
        className="fixed bottom-4 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[#1c1611]/80 ring-1 ring-[#d4af37]/30 backdrop-blur"
        style={{ right: "calc(clamp(80px, 22vw, 144px) + 24px)" }}
        >
          <span className="text-sm">🎙</span>
        </div>
      )}

      {state === "waitingForClaps" && (
        <div className="pointer-events-none fixed top-6 left-1/2 z-10 -translate-x-1/2 text-center w-[90vw] max-w-sm">
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "clamp(13px,4vw,18px)",
              color: "var(--coral)", margin: 0 }}>
              Blow out the candles!
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px",
              color: "var(--coral)", margin: "4px 0 0", letterSpacing: "0.1em" }}>
              {clapCount}/2
            </p>
          </div>
        </div>
      )}

      {(tracking.status === "requestingCamera" || tracking.status === "loadingModel") && (
        <MessageBanner>
          {tracking.status === "requestingCamera" ? "Requesting webcam access…" : "Loading hand tracking…"}
        </MessageBanner>
      )}
      {tracking.status === "permissionDenied" && (
        <MessageBanner>{tracking.errorMessage}</MessageBanner>
      )}
      {tracking.status === "error" && (
        <MessageBanner>
          Hand tracking couldn&apos;t start{tracking.errorMessage ? `: ${tracking.errorMessage}` : "."} Try reloading the page.
        </MessageBanner>
      )}
      {showHandsMessage && <MessageBanner>Show both hands to begin.</MessageBanner>}

      {showEnvelope && (
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <Envelope
            name={wish.name}
            age={wish.age}
            message={wish.message}
            senderName={wish.senderName}
            isOpen={state === "envelopeOpen"}
            onOpen={openEnvelope}
          />
        </div>
      )}

      {state === "envelopeOpen" && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-10 -translate-x-1/2">
          <div style={{
            background: "rgba(255,248,232,0.82)", backdropFilter: "blur(8px)",
            borderRadius: "9999px", padding: "6px 20px",
            border: "1.5px solid rgba(212,115,106,0.2)",
            fontSize: "clamp(10px, 3vw, 12px)", 
            color: "var(--text-mid)", fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
          }}>
            👏 Clap/Blow twice to relight · {clapCount}/2
          </div>
        </div>
      )}

      {everOpenedEnvelope && (
        <button
          type="button"
          onClick={() => setWishFormOpen(true)}
          className="fixed top-6 left-6 z-20"
          style={{
            padding: "8px 14px", borderRadius: "9999px", fontSize: "clamp(11px, 3vw, 13px)", fontWeight: 600,
            background: "linear-gradient(135deg, var(--coral), var(--peach))",
            color: "#fff", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
            boxShadow: "0 4px 16px rgba(212,115,106,0.35)",
            minHeight: "44px", //touch target
          }}
        >
          🎂 Create a Birthday Wish
        </button>
      )}

      <AudioPlayer active={musicActive} />

      {debug && (
        <DebugPanel
          palmDistance={tracking.palmDistance}
          handsVisible={tracking.handsVisible}
          thresholds={thresholds}
          onChange={setThresholds}
          clapCount={clapCount}
          clapsNeeded={clapsNeeded}
          state={state}
        />
      )}

      <AnimatePresence>
        {wishFormOpen && <WishForm onClose={() => setWishFormOpen(false)} />}
      </AnimatePresence>
    </main>
  );
}

function MessageBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center"
      style={{
        background: "rgba(255,248,232,0.88)",
        backdropFilter: "blur(12px)",
        borderRadius: "16px",
        padding: "14px 20px",
        boxShadow: "0 8px 32px rgba(92,51,32,0.15)",
        border: "1.5px solid rgba(212,115,106,0.2)",
        fontSize: "clamp(12px, 3.5vw, 14px)",
        color: "var(--text-dark)",
        fontFamily: "var(--font-sans)",
        width: "min(85vw, 320px)",
      }}>
      {children}
    </div>
  );
}