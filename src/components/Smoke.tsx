"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { smokeTexture } from "@/utils/textures";

interface SmokeProps {
  /** Increment this number to spawn a fresh puff burst (e.g. when a flame is blown out). */
  triggerKey: number;
  position?: [number, number, number];
}

const PARTICLE_COUNT = 6;
const LIFESPAN_MS = 1100;

export default function Smoke({ triggerKey, position = [0, 0, 0] }: SmokeProps) {
  const texture = smokeTexture();
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  const bornAt = useRef<number[]>(new Array(PARTICLE_COUNT).fill(-Infinity));
  const [offsets] = useState(() =>
    Array.from({ length: PARTICLE_COUNT }, () => ({
      dx: (Math.random() - 0.5) * 0.25,
      dz: (Math.random() - 0.5) * 0.25,
      speed: 0.35 + Math.random() * 0.25,
      spin: Math.random() * Math.PI * 2,
    }))
  );

  useEffect(() => {
    if (triggerKey <= 0) return;
    const now = performance.now();
    bornAt.current = bornAt.current.map((_, i) => now + i * 40);
  }, [triggerKey]);

  useFrame(() => {
    const now = performance.now();
    refs.current.forEach((sprite, i) => {
      if (!sprite) return;
      const age = now - bornAt.current[i];
      if (age < 0 || age > LIFESPAN_MS) {
        sprite.visible = false;
        return;
      }
      const p = age / LIFESPAN_MS;
      sprite.visible = true;
      const { dx, dz, speed } = offsets[i];
      sprite.position.set(dx * p, 0.15 + p * speed, dz * p);
      const scale = 0.08 + p * 0.5;
      sprite.scale.set(scale, scale, 1);
      const mat = sprite.material as THREE.SpriteMaterial;
      mat.opacity = (1 - p) * 0.6;
    });
  });

  return (
    <group position={position}>
      {offsets.map((_, i) => (
        <sprite key={i} ref={(el) => { refs.current[i] = el; }} visible={false}>
          <spriteMaterial map={texture} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}
