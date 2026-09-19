"use client";

import { ClapThresholds } from "@/hooks/useClapDetection";

interface DebugPanelProps {
  palmDistance: number | null;
  handsVisible: number;
  thresholds: ClapThresholds;
  onChange: (t: ClapThresholds) => void;
  clapCount: number;
  clapsNeeded: number;
  state: string;
}

export default function DebugPanel({
  palmDistance,
  handsVisible,
  thresholds,
  onChange,
  clapCount,
  clapsNeeded,
  state,
}: DebugPanelProps) {
  return (
    <div className="fixed bottom-4 left-4 z-30 w-64 space-y-2 rounded-lg bg-black/75 p-3 font-mono text-[11px] text-[#caffd0] backdrop-blur">
      <p>state: {state}</p>
      <p>hands: {handsVisible}</p>
      <p>distance: {palmDistance !== null ? palmDistance.toFixed(3) : "—"}</p>
      <p>claps: {clapCount}/{clapsNeeded || "-"}</p>
      <Slider label="closeThreshold" value={thresholds.closeThreshold} min={0.02} max={0.5} step={0.01}
        onChange={(v) => onChange({ ...thresholds, closeThreshold: v })} />
      <Slider label="openThreshold" value={thresholds.openThreshold} min={0.05} max={0.7} step={0.01}
        onChange={(v) => onChange({ ...thresholds, openThreshold: v })} />
      <Slider label="approachVelocity" value={thresholds.approachVelocity} min={0.01} max={0.3} step={0.01}
        onChange={(v) => onChange({ ...thresholds, approachVelocity: v })} />
      <Slider label="debounceMs" value={thresholds.debounceMs} min={100} max={600} step={10}
        onChange={(v) => onChange({ ...thresholds, debounceMs: v })} />
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between"><span>{label}</span><span>{value}</span></span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}