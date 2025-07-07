import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EnemyData {
  id: string;
  position: THREE.Vector3;
  health: number;
}

interface EnemyProps {
  enemy: EnemyData;
}

export default function Enemy({ enemy }: EnemyProps) {
  const enemyRef = useRef<THREE.Mesh>(null);
  
  // Pre-calculate random values for animation
  const animationOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const bobSpeed = useMemo(() => 1 + Math.random(), []);

  useFrame((state) => {
    if (!enemyRef.current) return;
    
    // Simple bobbing animation
    const time = state.clock.elapsedTime;
    enemyRef.current.position.y = enemy.position.y + Math.sin(time * bobSpeed + animationOffset) * 0.2;
    
    // Rotation animation
    enemyRef.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={enemyRef} position={enemy.position} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ff0000" />
    </mesh>
  );
}
