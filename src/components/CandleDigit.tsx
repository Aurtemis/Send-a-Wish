"use client";

import { Component, ReactNode, Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import Flame from "./Flame";
import Smoke from "./Smoke";

// Measured from /public/candles/0.glb bounding box:
// X: -0.149 → +0.160  (digit width, 0.31 units)
// Y: -0.07  → +0.07   (extrusion depth)
// Z: -0.556 → 0       (digit height — Blender Y mapped to glTF -Z)

const MODEL_HALF = 1;

interface CandleDigitProps {
  digit: string;
  lit: boolean;
  blowoutTriggerKey: number;
  position?: [number, number, number];
  /**
   * Default is MODEL_HEIGHT + 0.025 (just above wick tip at scale 1).
   * If you change candleScale, update this: MODEL_HEIGHT * candleScale + 0.025
   */
  flameY?: number;
  candleScale?: number;
}

class CandleErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { /* expected until all 10 .glb files are present */ }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// --- GLB model --------------------------------------------------------------
function GltfCandle({ digit, scale }: { digit: string; scale: number }) {
  const { scene } = useGLTF(`/candles/${digit}.glb`);
  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: "#f2e6ce",
          roughness: 0.48,
          metalness: 0.02,
        });
        mesh.material.needsUpdate = true;
      }
    });
    return c;
  }, [scene]);

  return (
  <primitive 
    object={clone} 
    scale={scale}
    position={[0, MODEL_HALF * scale, 0]}
    />
  );
}

// --- CandleDigit ------------------------------------------------------------
export default function CandleDigit({
  digit,
  lit,
  blowoutTriggerKey,
  position = [0, 0, 0],
  flameY,
  candleScale = 1,
}: CandleDigitProps) {
  const resolvedFlameY = flameY ?? MODEL_HALF * 2 * candleScale + 0.05;
  
  return (
    <group position={position}>
      <CandleErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <GltfCandle digit={digit} scale={candleScale} />
        </Suspense>
      </CandleErrorBoundary>
      <Flame lit={lit} position={[0, resolvedFlameY, 0]} scale={0.9} />
      <Smoke triggerKey={blowoutTriggerKey} position={[0, resolvedFlameY, 0]} />
    </group>
  );
}

export { MODEL_HALF };
