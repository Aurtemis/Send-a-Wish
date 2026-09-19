"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Cake, { CAKE_TOP_Y, CAKE_SCALE } from "./Cake";
import NumberCandle from "./NumberCandle";
import Confetti from "./Confetti";
import Balloons from "./Balloons";

interface SceneProps {
  age: number;
  lit: boolean;
  blowoutTriggerKey: number;
  celebrateTriggerKey: number;
}

const FOV_DEG = 38;
const CANDLE_SCALE = 0.2;
const CANDLE_HEIGHT = 1 * 2 * CANDLE_SCALE;
const FLAME_EXTRA = 0.15;
const SCENE_TOP_Y = CAKE_TOP_Y + CANDLE_HEIGHT + FLAME_EXTRA;

const TARGET = new THREE.Vector3(0, SCENE_TOP_Y * 0.48, 0);
const VIEW_DIR = new THREE.Vector3(0, 0.5, 3.4).normalize();
const CONTENT_HALF_HEIGHT = SCENE_TOP_Y * 0.58;
const CONTENT_HALF_WIDTH = (3.2 * CAKE_SCALE) * 0.58;
const MIN_DISTANCE = 2.2;

function ClearEnvironment() {
  const { scene } = useThree();
  useEffect(() => {
    scene.environment = null;
    const toRemove: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (
        obj instanceof THREE.DirectionalLight ||
        obj instanceof THREE.HemisphereLight
      ) {
        toRemove.push(obj);
      }
    });
    toRemove.forEach((obj) => obj.removeFromParent());
  }, [scene]);
  return null;
}

function CameraRig() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const vFov = (FOV_DEG * Math.PI) / 180;
    const distanceForHeight = CONTENT_HALF_HEIGHT / Math.tan(vFov / 2);
    const distanceForWidth = CONTENT_HALF_WIDTH / (Math.tan(vFov / 2) * aspect);
    const distance = Math.max(distanceForHeight, distanceForWidth, MIN_DISTANCE);
    camera.position.copy(TARGET).addScaledVector(VIEW_DIR, distance);
    camera.lookAt(TARGET);
  }, [camera, size.width, size.height]);
  return null;
}

export default function Scene({ age, lit, blowoutTriggerKey, celebrateTriggerKey }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 1, 3], fov: FOV_DEG }}
      gl={{
        antialias: true,
        toneMapping: THREE.CineonToneMapping,
        toneMappingExposure: 0.9,
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#698092"]} />
      <fog attach="fog" args={["#1a0e08", 7, 18]} />

      <ClearEnvironment />

      {/* Very dim warm ambient — just enough to prevent pure black, not a light source */}
      <ambientLight intensity={0.12} color="#ff9a4a" />

      {/* Candle flame glow — the primary light source, warm and bright */}
      <pointLight
        position={[0, CAKE_TOP_Y + 0.25, 0]}
        intensity={3.5}
        color="#ffb454"
        distance={4}
        decay={2}
      />

      {/* Soft overhead warm fill — like a dim room lamp far away */}
      <pointLight
        position={[0, 2.8, 0.8]}
        intensity={0.9}
        color="#ff9a4a"
        distance={6}
        decay={2}
      />

      {/* Subtle left and right fills so no side goes fully black */}
      <pointLight
        position={[-1.8, 0.8, 1.0]}
        intensity={0.3}
        color="#ff8c3a"
        distance={4}
        decay={2}
      />
      <pointLight
        position={[1.8, 0.8, 1.0]}
        intensity={0.35}
        color="#ff8c3a"
        distance={4}
        decay={2}
      />

      {/* Soft back fill so the rear of the cake isn't completely dark */}
      <pointLight
        position={[0, 1.2, -2.0]}
        intensity={0.2}
        color="#ff7a2a"
        distance={4}
        decay={2}
      />

      <Cake />

      <NumberCandle
        age={age}
        lit={lit}
        blowoutTriggerKey={blowoutTriggerKey}
        position={[0, CAKE_TOP_Y, 0]}
        candleScale={CANDLE_SCALE}
        slotWidth={0.1}
      />

      <Confetti triggerKey={celebrateTriggerKey} />
      <Balloons triggerKey={celebrateTriggerKey} />

      <CameraRig />

      <OrbitControls
        target={[TARGET.x, TARGET.y, TARGET.z]}
        enablePan={false}
        enableZoom={false}
        touches= {{ ONE: 2, TWO: 0 }}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-0.6}
        maxAzimuthAngle={0.6}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
