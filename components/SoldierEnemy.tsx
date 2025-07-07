import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";

interface EnemyData {
  id: string;
  position: THREE.Vector3;
  health: number;
  targetPosition?: THREE.Vector3;
  lastShot?: number;
  canShoot?: boolean;
  maxHealth?: number;
}

interface SoldierEnemyProps {
  enemy: EnemyData;
  gameMode: 'practice' | '1v1';
  playerPosition: THREE.Vector3;
}

export default function SoldierEnemy({ enemy, gameMode, playerPosition }: SoldierEnemyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { addScore, removeEnemy, bullets } = useGameState();
  const { playHit } = useAudio();
  
  // Pre-calculate random values for animation and movement
  const animationOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const moveSpeed = useMemo(() => 0.5 + Math.random() * 0.5, []);
  const patrolRadius = useMemo(() => 3 + Math.random() * 4, []);
  const originalPosition = useMemo(() => enemy.position.clone(), []);
  
  // Initialize target position for patrol
  useEffect(() => {
    if (!enemy.targetPosition) {
      const angle = Math.random() * Math.PI * 2;
      enemy.targetPosition = new THREE.Vector3(
        originalPosition.x + Math.cos(angle) * patrolRadius,
        originalPosition.y,
        originalPosition.z + Math.sin(angle) * patrolRadius
      );
    }
  }, [enemy, originalPosition, patrolRadius]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Animate soldier (walking animation)
    const walkCycle = Math.sin(time * 4 + animationOffset) * 0.1;
    groupRef.current.position.y = enemy.position.y + walkCycle;
    
    // Rotate arms for walking
    const leftArm = groupRef.current.getObjectByName('leftArm');
    const rightArm = groupRef.current.getObjectByName('rightArm');
    if (leftArm && rightArm) {
      leftArm.rotation.x = Math.sin(time * 4 + animationOffset) * 0.3;
      rightArm.rotation.x = -Math.sin(time * 4 + animationOffset) * 0.3;
    }

    // Movement AI - patrol around original position
    if (enemy.targetPosition) {
      const distanceToTarget = enemy.position.distanceTo(enemy.targetPosition);
      
      if (distanceToTarget < 1) {
        // Reached target, pick new random position
        const angle = Math.random() * Math.PI * 2;
        enemy.targetPosition.set(
          originalPosition.x + Math.cos(angle) * patrolRadius,
          originalPosition.y,
          originalPosition.z + Math.sin(angle) * patrolRadius
        );
      } else {
        // Move towards target
        const direction = enemy.targetPosition.clone().sub(enemy.position).normalize();
        enemy.position.add(direction.multiplyScalar(moveSpeed * delta));
        
        // Face movement direction
        groupRef.current.lookAt(enemy.targetPosition);
      }
    }

    // Update group position
    groupRef.current.position.copy(enemy.position);

    // 1v1 mode: Enemy can shoot at player
    if (gameMode === '1v1' && enemy.canShoot) {
      const distanceToPlayer = enemy.position.distanceTo(playerPosition);
      const currentTime = Date.now();
      
      // Shoot at player if close enough and enough time has passed
      if (distanceToPlayer < 15 && (!enemy.lastShot || currentTime - enemy.lastShot > 2000)) {
        shootAtPlayer();
        enemy.lastShot = currentTime;
      }
    }

    // Check bullet collisions
    bullets.forEach(bullet => {
      // Only check collisions for non-enemy bullets
      if (!bullet.isEnemyBullet) {
        const distance = bullet.position.distanceTo(enemy.position);
        if (distance < 1.5) {
          console.log("Soldier hit!");
          
          // Reduce enemy health
          if (gameMode === '1v1') {
            enemy.health -= 5; // 5 damage per bullet in 1v1 mode
            console.log(`Enemy health: ${enemy.health}/${enemy.maxHealth || 100}`);
            
            if (enemy.health <= 0) {
              removeEnemy(enemy.id);
              addScore(100); // Big points for defeating 1v1 enemy
              console.log("1v1 Enemy defeated!");
            } else {
              addScore(5); // Small points for hitting
            }
          } else {
            // Practice mode - one hit kill
            removeEnemy(enemy.id);
            addScore(15);
            
            // Spawn new enemy after a delay
            setTimeout(() => {
              respawnEnemy();
            }, 1000 + Math.random() * 2000);
          }
          
          playHit();
        }
      }
    });
  });

  const shootAtPlayer = () => {
    const { addBullet, damagePlayer } = useGameState.getState();
    
    // Calculate direction from enemy to player
    const direction = playerPosition.clone().sub(enemy.position).normalize();
    
    // Create enemy bullet
    const enemyBullet = {
      id: `enemy_bullet_${Date.now()}_${Math.random()}`,
      position: enemy.position.clone().add(new THREE.Vector3(0, 1, 0)), // Shoot from chest height
      direction: direction,
      speed: 20,
      life: 3,
      isEnemyBullet: true
    };
    
    addBullet(enemyBullet);
    console.log("Enemy shooting at player!");
    playHit(); // Play shooting sound
  };

  const respawnEnemy = () => {
    const { addEnemy } = useGameState.getState();
    const newPosition = generateRandomPosition();
    
    const newEnemy: EnemyData = {
      id: `soldier_${Date.now()}_${Math.random()}`,
      position: newPosition,
      health: 1,
      canShoot: gameMode === '1v1'
    };
    
    addEnemy(newEnemy);
  };

  const generateRandomPosition = (): THREE.Vector3 => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 10 + Math.random() * 30;
    return new THREE.Vector3(
      Math.cos(angle) * distance,
      1,
      Math.sin(angle) * distance
    );
  };

  return (
    <group ref={groupRef} position={enemy.position}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 1, 0.3]} />
        <meshStandardMaterial color="#4a5d23" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#d2b48c" />
      </mesh>
      
      {/* Helmet */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[0.45, 0.2, 0.45]} />
        <meshStandardMaterial color="#2d3d0f" />
      </mesh>
      
      {/* Left Arm */}
      <mesh name="leftArm" position={[-0.4, 0.7, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#4a5d23" />
      </mesh>
      
      {/* Right Arm */}
      <mesh name="rightArm" position={[0.4, 0.7, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#4a5d23" />
      </mesh>
      
      {/* Left Leg */}
      <mesh position={[-0.15, -0.4, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#2d3d0f" />
      </mesh>
      
      {/* Right Leg */}
      <mesh position={[0.15, -0.4, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#2d3d0f" />
      </mesh>
      
      {/* Gun */}
      <mesh position={[0.3, 0.8, -0.1]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Backpack */}
      <mesh position={[0, 0.6, 0.2]} castShadow>
        <boxGeometry args={[0.4, 0.6, 0.2]} />
        <meshStandardMaterial color="#2d3d0f" />
      </mesh>
    </group>
  );
}