"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BalloonsProps {
  triggerKey: number;
}

const COUNT = 9;
const LIFESPAN_MS = 5200;
const COLORS = ["#e0556e", "#f2a13b", "#4f9fd8", "#7fb676", "#d4af37", "#caa0d6"];

export default function Balloons({ triggerKey }: BalloonsProps) {
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const bornAt = useRef<number[]>(new Array(COUNT).fill(-Infinity));

  const [setup] = useState(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      x: (Math.random() - 0.5) * 3.2,
      z: (Math.random() - 0.5) * 1.4 - 0.4,
      speed: 0.55 + Math.random() * 0.35,
      sway: 0.3 + Math.random() * 0.4,
      swaySpeed: 0.6 + Math.random() * 0.6,
      color: COLORS[i % COLORS.length],
      delay: i * 90,
    }))
  );

  useEffect(() => {
    if (triggerKey <= 0) return;
    const now = performance.now();
    bornAt.current = setup.map((s) => now + s.delay);
  }, [triggerKey, setup]);

  useFrame(() => {
    const now = performance.now();
    groupRefs.current.forEach((g, i) => {
      if (!g) return;
      const age = now - bornAt.current[i];
      if (age < 0 || age > LIFESPAN_MS) {
        g.visible = false;
        return;
      }
      g.visible = true;
      const p = age / LIFESPAN_MS;
      const s = setup[i];
      g.position.set(
        s.x + Math.sin(age / 1000 * s.swaySpeed) * s.sway,
        -0.4 + p * (3.2 + s.speed),
        s.z
      );
      const fadeIn = Math.min(1, age / 300);
      const fadeOut = p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1;
      g.scale.setScalar(Math.min(fadeIn, fadeOut) * 0.42);
    });
  });

  return (
    <group>
      {setup.map((s, i) => (
        <group key={i} ref={(el) => { groupRefs.current[i] = el; }} visible={false}>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.5, 20, 20]} />
            <meshStandardMaterial color={s.color} roughness={0.25} metalness={0.05} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <coneGeometry args={[0.07, 0.12, 8]} />
            <meshStandardMaterial color={s.color} roughness={0.25} />
          </mesh>
          <mesh position={[0, -0.65, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 1.1, 4]} />
            <meshStandardMaterial color="#cfc6b8" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
