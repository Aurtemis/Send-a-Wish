import { useCallback, useEffect, useRef, useState } from "react";
import { GameState } from "@/types";

const BLOWOUT_CLAP_COUNT = 2;
const BLOWOUT_CLAP_WINDOW_MS = 3000;
const RELIGHT_CLAP_COUNT = 2;
const RELIGHT_CLAP_WINDOW_MS = 6000;
const BLOWOUT_DURATION_MS = 1500;
const RESET_DURATION_MS = 1000;

export interface GameStateResult {
  state: GameState;
  clapCount: number;
  clapsNeeded: number;
  openEnvelope: () => void;
}

export function useGameState(clapEventId: number, ready: boolean): GameStateResult {
  const [state, setState] = useState<GameState>("loading");
  const [clapCount, setClapCount] = useState(0);
  const clapTimestamps = useRef<number[]>([]);
  const prevClapEventId = useRef(clapEventId);

  useEffect(() => {
    if (ready && state === "loading") setState("waitingForClaps");
  }, [ready, state]);

  useEffect(() => {
    if (clapEventId === prevClapEventId.current) return;
    prevClapEventId.current = clapEventId;
    const now = performance.now();

    if (state === "waitingForClaps") {
      const ts = clapTimestamps.current.filter((t) => now - t < BLOWOUT_CLAP_WINDOW_MS);
      ts.push(now);
      clapTimestamps.current = ts;
      setClapCount(ts.length);
      if (ts.length >= BLOWOUT_CLAP_COUNT) {
        clapTimestamps.current = [];
        setClapCount(0);
        setState("blowingOut");
      }
    } else if (state === "envelopeOpen") {
      const ts = clapTimestamps.current.filter((t) => now - t < RELIGHT_CLAP_WINDOW_MS);
      ts.push(now);
      clapTimestamps.current = ts;
      setClapCount(ts.length);
      if (ts.length >= RELIGHT_CLAP_COUNT) {
        clapTimestamps.current = [];
        setClapCount(0);
        setState("resetting");
      }
    }
  }, [clapEventId, state]);

  useEffect(() => {
    if (state === "waitingForClaps" || state === "envelopeOpen") {
      clapTimestamps.current = [];
      setClapCount(0);
    }
  }, [state]);

  useEffect(() => {
    if (state === "blowingOut") {
      const id = setTimeout(() => setState("waitingForEnvelope"), BLOWOUT_DURATION_MS);
      return () => clearTimeout(id);
    }
    if (state === "resetting") {
      const id = setTimeout(() => setState("waitingForClaps"), RESET_DURATION_MS);
      return () => clearTimeout(id);
    }
  }, [state]);

  const openEnvelope = useCallback(() => {
    setState((s) => (s === "waitingForEnvelope" ? "envelopeOpen" : s));
  }, []);

  const clapsNeeded =
    state === "waitingForClaps" ? BLOWOUT_CLAP_COUNT :
    state === "envelopeOpen" ? RELIGHT_CLAP_COUNT : 0;

  return { state, clapCount, clapsNeeded, openEnvelope };
}