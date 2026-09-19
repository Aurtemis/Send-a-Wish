"use client";

import CandleDigit, { MODEL_HALF } from "./CandleDigit";

interface NumberCandleProps {
  age: number;
  lit: boolean;
  blowoutTriggerKey: number;
  position?: [number, number, number];
  /**
   * Horizontal spacing between digit slots (scene units).
   * Default is MODEL_WIDTH + 0.05 — a small gap between digits.
   * Widen if digits overlap; narrow if too spread out.
   */
  slotWidth?: number;
  flameY?: number;
  candleScale?: number;
}

export default function NumberCandle({
  age,
  lit,
  blowoutTriggerKey,
  position = [0, 0, 0],
  slotWidth,
  flameY,
  candleScale = 1,
}: NumberCandleProps) {
  const resolvedSlotWidth = slotWidth ?? MODEL_HALF * 2 * candleScale + 0.02;
  const clamped = Math.min(100, Math.max(1, Math.round(age)));
  const digits = String(clamped).split("");
  const totalWidth = (digits.length - 1) * resolvedSlotWidth;
  const startX = -totalWidth / 2;

  return (
    <group position={position}>
      {digits.map((d, i) => (
        <CandleDigit
          key={i}
          digit={d}
          lit={lit}
          blowoutTriggerKey={blowoutTriggerKey}
          position={[startX + i * resolvedSlotWidth, 0, 0]}
          flameY={flameY}
          candleScale={candleScale}
        />
      ))}
    </group>
  );
}