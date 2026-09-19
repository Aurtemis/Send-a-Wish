"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ConfettiProps {
  triggerKey: number;
}

const COUNT = 90;
const LIFESPAN_MS = 3200;
const COLORS = ["#e0556e", "#f2a13b", "#ffd76a", "#4f9fd8", "#7fb676", "#d4af37"];

const dummy = new THREE.Object3D();

export default function Confetti({ triggerKey }: ConfettiProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const bornAt = useRef(performance.now());

  const [setup] = useState(() =>
    Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 3.4,
      z: (Math.random() - 0.5) * 1.6,
      fallSpeed: 0.9 + Math.random() * 0.9,
      spin: (Math.random() - 0.5) * 8,
      sway: (Math.random() - 0.5) * 0.6,
      delay: Math.random() * 500,
      startY: 2.6 + Math.random() * 0.8,
    }))
  );

  const colorAttr = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    setup.forEach((_, i) => {
      const c = new THREE.Color(COLORS[i % COLORS.length]);
      arr.set([c.r, c.g, c.b], i * 3);
    });
    return arr;
  }, [setup]);

  useEffect(() => {
    if (triggerKey <= 0) return;
    bornAt.current = performance.now();
  }, [triggerKey]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const now = performance.now();
    const age = now - bornAt.current;

    setup.forEach((s, i) => {
      const localAge = age - s.delay;
      const visible = localAge > 0 && localAge < LIFESPAN_MS;
      if (!visible) {
        dummy.scale.setScalar(0);
      } else {
        const p = localAge / LIFESPAN_MS;
        dummy.position.set(s.x + Math.sin(p * 6) * s.sway, s.startY - p * s.fallSpeed * 3.4, s.z);
        dummy.rotation.set(p * s.spin, p * s.spin * 1.3, p * s.spin * 0.7);
        dummy.scale.setScalar(0.06);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <planeGeometry args={[1, 1.6]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorAttr, 3]} />
      </planeGeometry>
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.6} />
    </instancedMesh>
  );
}
