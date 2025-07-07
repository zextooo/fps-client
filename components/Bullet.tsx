import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../lib/stores/useGameState";

interface BulletData {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  life: number;
  isEnemyBullet?: boolean;
}

interface BulletProps {
  bullet: BulletData;
  playerPosition?: THREE.Vector3;
}

export default function Bullet({ bullet, playerPosition }: BulletProps) {
  const bulletRef = useRef<THREE.Mesh>(null);
  const { removeBullet, damagePlayer } = useGameState();
  const startTime = useRef(Date.now());

  useFrame((state, delta) => {
    if (!bulletRef.current) return;

    // Move bullet
    const movement = bullet.direction.clone().multiplyScalar(bullet.speed * delta);
    bulletRef.current.position.add(movement);
    bullet.position.copy(bulletRef.current.position);

    // Check player collision for enemy bullets
    if (bullet.isEnemyBullet && playerPosition) {
      const distance = bulletRef.current.position.distanceTo(playerPosition);
      if (distance < 1.5) {
        console.log("Player hit by enemy bullet! -5 health");
        damagePlayer(5);
        removeBullet(bullet.id);
        return;
      }
    }

    // Remove bullet after lifetime
    if (Date.now() - startTime.current > bullet.life) {
      console.log("Bullet expired, removing");
      removeBullet(bullet.id);
    }

    // Remove bullet if it goes too far
    if (bulletRef.current.position.length() > 100) {
      console.log("Bullet went too far, removing");
      removeBullet(bullet.id);
    }
  });

  return (
    <mesh ref={bulletRef} position={bullet.position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial 
        color={bullet.isEnemyBullet ? "#ff4444" : "#ffff00"} 
        emissive={bullet.isEnemyBullet ? "#ff4444" : "#ffff00"} 
        emissiveIntensity={0.5} 
      />
    </mesh>
  );
}
