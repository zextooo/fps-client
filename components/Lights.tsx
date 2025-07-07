import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Lights() {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    if (directionalLightRef.current) {
      // Simple sun movement
      const time = state.clock.elapsedTime * 0.1;
      directionalLightRef.current.position.x = Math.sin(time) * 20;
      directionalLightRef.current.position.z = Math.cos(time) * 20;
    }
  });

  return (
    <>
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.3} />
      
      {/* Main directional light (sun) */}
      <directionalLight
        ref={directionalLightRef}
        position={[10, 20, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      
      {/* Point light for additional lighting */}
      <pointLight position={[0, 10, 0]} intensity={0.5} distance={30} />
    </>
  );
}
