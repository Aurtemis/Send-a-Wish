"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Measured from /public/cake.glb (world-space bounds at scale=1):
// Y: 0.044 → 2.291  (height 2.246)
// X: -1.6  → +1.6   (width 3.2, widest at base)
// Top surface of top tier: Y = 2.2908
export const CAKE_SCALE = 0.28; // scale factor to make cake fit nicely in the scene
export const CAKE_TOP_Y = 0.45; // 1.031 — candles go here

// Assign flat matte colours per tier, matching the intended Blender design.
// Keyed by node name from the GLB.


function GltfCake() {
  const { scene } = useGLTF("/cake.glb");
  return <primitive object={scene} scale={CAKE_SCALE} />;
}

export default function Cake() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={groupRef}>
      <GltfCake />
    </group>
  );
}