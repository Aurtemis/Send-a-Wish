"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { flameTexture } from "@/utils/textures";

interface FlameProps {
  lit: boolean;
  position?: [number, number, number];
  scale?: number;
}

/** A single flickering candle flame. Continuously lerps toward lit/extinguished, which
 * naturally produces the "shrink, fade, dim" blowout behavior from PRD section 11. */
export default function Flame({ lit, position = [0, 0, 0], scale = 1 }: FlameProps) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const intensity = useRef(lit ? 1 : 0);
  const seed = useRef(Math.random() * 1000);
  const texture = flameTexture();

  useFrame((three, delta) => {
    const target = lit ? 1 : 0;
    intensity.current += (target - intensity.current) * Math.min(1, delta * 4.5);

    const t = three.clock.elapsedTime + seed.current;
    const flicker =
      0.65 +
      Math.sin(t * 14) * 0.08 +
      Math.sin(t * 27.3) * 0.05 +
      (Math.random() - 0.5) * 0.04;
    const finalScale = scale * intensity.current * Math.max(0.04, flicker);

    if (spriteRef.current) {
      spriteRef.current.scale.set(finalScale * 0.5, finalScale * 0.85, 1);
      const mat = spriteRef.current.material as THREE.SpriteMaterial;
      mat.opacity = intensity.current;
      spriteRef.current.position.x = Math.sin(t * 9) * 0.005 * intensity.current;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.6 * intensity.current * flicker;
    }
  });

  return (
    <group position={position}>
      <sprite ref={spriteRef} position={[0, 0.1, 0]}>
        <spriteMaterial
          map={texture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <pointLight ref={lightRef} color="#ffb454" distance={1.5} position={[0, 0.1, 0]} />
    </group>
  );
}
