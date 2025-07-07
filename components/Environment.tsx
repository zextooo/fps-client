import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import SoldierEnemy from "./SoldierEnemy";
import { useGameState } from "../lib/stores/useGameState";

export default function Environment() {
  const grassTexture = useTexture("/textures/grass.png");
  const { enemies, gameMode } = useGameState();
  const { camera } = useThree();
  
  // Configure texture tiling
  useMemo(() => {
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);
  }, [grassTexture]);

  return (
    <>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial map={grassTexture} />
      </mesh>
      
      {/* Boundary walls */}
      <mesh position={[0, 5, -50]} castShadow>
        <boxGeometry args={[100, 10, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[0, 5, 50]} castShadow>
        <boxGeometry args={[100, 10, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[-50, 5, 0]} castShadow>
        <boxGeometry args={[1, 10, 100]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[50, 5, 0]} castShadow>
        <boxGeometry args={[1, 10, 100]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Cover objects - Trees and Boxes */}
      {/* Large wooden crates */}
      <mesh position={[10, 1, -10]} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[-15, 1, 20]} castShadow>
        <boxGeometry args={[3, 2, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[25, 1.5, 15]} castShadow>
        <boxGeometry args={[1.5, 3, 1.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Trees */}
      <group position={[-20, 0, -15]}>
        <mesh position={[0, 3, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 6]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[0, 6, 0]} castShadow>
          <sphereGeometry args={[2, 8, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      </group>
      
      <group position={[30, 0, -25]}>
        <mesh position={[0, 3, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 6]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[0, 6, 0]} castShadow>
          <sphereGeometry args={[2, 8, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      </group>
      
      {/* Metal containers */}
      <mesh position={[-10, 1.5, -25]} castShadow>
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      <mesh position={[15, 1, 25]} castShadow>
        <boxGeometry args={[2.5, 2, 2.5]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Stone barriers */}
      <mesh position={[0, 0.5, -30]} castShadow>
        <boxGeometry args={[8, 1, 1]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      
      <mesh position={[-25, 0.5, 5]} castShadow>
        <boxGeometry args={[1, 1, 6]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      
      {/* Render enemies */}
      {enemies.map(enemy => (
        <SoldierEnemy 
          key={enemy.id} 
          enemy={enemy} 
          gameMode={gameMode}
          playerPosition={camera.position}
        />
      ))}
    </>
  );
}
