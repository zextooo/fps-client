import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../lib/stores/useGameState";

interface CollectibleData {
  id: string;
  position: THREE.Vector3;
  type: 'coin' | 'gem';
  value: number;
}

interface CollectibleProps {
  collectible: CollectibleData;
  playerPosition: THREE.Vector3;
}

export default function Collectible({ collectible, playerPosition }: CollectibleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { removeCollectible, addCurrency } = useGameState();
  
  // Pre-calculate random values for animation
  const rotationSpeed = useMemo(() => 0.5 + Math.random() * 1, []);
  const bobOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const bobSpeed = useMemo(() => 2 + Math.random() * 2, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Floating animation
    const time = state.clock.elapsedTime;
    meshRef.current.position.y = collectible.position.y + Math.sin(time * bobSpeed + bobOffset) * 0.3;
    
    // Rotation animation
    meshRef.current.rotation.y += rotationSpeed * delta;
    
    // Check if player is close enough to collect
    const distance = playerPosition.distanceTo(collectible.position);
    if (distance < 2) {
      console.log(`Collected ${collectible.type}: +${collectible.value}`);
      
      // Add currency to localStorage and state
      const currentCoins = parseInt(localStorage.getItem('coins') || '0');
      const currentGems = parseInt(localStorage.getItem('gems') || '0');
      
      if (collectible.type === 'coin') {
        localStorage.setItem('coins', (currentCoins + collectible.value).toString());
        addCurrency('coins', collectible.value);
      } else {
        localStorage.setItem('gems', (currentGems + collectible.value).toString());
        addCurrency('gems', collectible.value);
      }
      
      removeCollectible(collectible.id);
    }
  });

  return (
    <mesh ref={meshRef} position={collectible.position} castShadow>
      {collectible.type === 'coin' ? (
        <>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </>
      ) : (
        <>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial 
            color="#00FFFF" 
            emissive="#00FFFF" 
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </>
      )}
      
      {/* Glow effect */}
      <pointLight 
        color={collectible.type === 'coin' ? '#FFD700' : '#00FFFF'}
        intensity={0.5}
        distance={5}
        position={[0, 0, 0]}
      />
    </mesh>
  );
}