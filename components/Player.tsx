import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import Gun from "./Gun";
import Bullet from "./Bullet";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";

interface PlayerProps {
  camera: THREE.Camera;
}

enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  jump = 'jump',
  shoot = 'shoot',
  viewToggle = 'viewToggle'
}

export default function Player({ camera }: PlayerProps) {
  const playerRef = useRef<THREE.Group>(null);
  const velocityRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());
  const [subscribe, getKeys] = useKeyboardControls<Controls>();
  const { 
    bullets, enemies, addBullet, removeEnemy, addScore, ammo, reduceAmmo, reloadAmmo, 
    isReloading, gameMode, viewMode, selectedWeapon, toggleViewMode 
  } = useGameState();
  const { playHit } = useAudio();
  
  const moveSpeed = 5;
  const jumpForce = 8;
  const gravity = -20;
  const isGrounded = useRef(true);

  // Handle mouse click for shooting and keyboard controls
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0 && ammo > 0 && !isReloading) { // Left click and has ammo
        shoot();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyR' && !isReloading && ammo < 30) {
        console.log("Reload key pressed");
        reloadAmmo();
      }
      if (event.code === 'KeyV') {
        toggleViewMode();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ammo, isReloading, reloadAmmo]);

  const shoot = () => {
    if (ammo <= 0 || isReloading) return;
    
    console.log("Shooting bullet");
    reduceAmmo();
    
    const bulletId = Math.random().toString(36).substr(2, 9);
    const cameraWorldPos = new THREE.Vector3();
    camera.getWorldPosition(cameraWorldPos);
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    addBullet({
      id: bulletId,
      position: cameraWorldPos.clone(),
      direction: direction.normalize(),
      speed: 50,
      life: 3000 // 3 seconds
    });
    
    playHit(); // Play shooting sound
  };

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const keys = getKeys();
    
    // Reset direction
    directionRef.current.set(0, 0, 0);
    
    // Get camera direction for movement
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Keep movement horizontal
    cameraDirection.normalize();
    
    const rightDirection = new THREE.Vector3();
    rightDirection.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
    
    // Handle movement
    if (keys.forward) {
      console.log("Moving forward");
      directionRef.current.add(cameraDirection);
    }
    if (keys.backward) {
      console.log("Moving backward");
      directionRef.current.sub(cameraDirection);
    }
    if (keys.leftward) {
      console.log("Moving left");
      directionRef.current.sub(rightDirection);
    }
    if (keys.rightward) {
      console.log("Moving right");
      directionRef.current.add(rightDirection);
    }
    
    // Normalize diagonal movement
    if (directionRef.current.length() > 0) {
      directionRef.current.normalize();
      directionRef.current.multiplyScalar(moveSpeed);
    }
    
    // Apply horizontal movement
    velocityRef.current.x = directionRef.current.x;
    velocityRef.current.z = directionRef.current.z;
    
    // Handle jumping
    if (keys.jump && isGrounded.current) {
      console.log("Jumping");
      velocityRef.current.y = jumpForce;
      isGrounded.current = false;
    }
    
    // Apply gravity
    velocityRef.current.y += gravity * delta;
    
    // Ground collision
    const newPosition = camera.position.clone();
    newPosition.add(velocityRef.current.clone().multiplyScalar(delta));
    
    if (newPosition.y <= 2) { // Player height above ground
      newPosition.y = 2;
      velocityRef.current.y = 0;
      isGrounded.current = true;
    }
    
    // Update camera position
    camera.position.copy(newPosition);
    
    // Update bullets and check collisions
    bullets.forEach(bullet => {
      // Check collision with enemies
      enemies.forEach(enemy => {
        const distance = bullet.position.distanceTo(enemy.position);
        if (distance < 1.5) { // Hit radius
          console.log("Bullet hit enemy!");
          removeEnemy(enemy.id);
          addScore(10);
          playHit(); // Play hit sound
        }
      });
    });
  });

  // Adjust camera position based on view mode
  useEffect(() => {
    if (viewMode === 'tps') {
      // Third person - camera further back and higher
      camera.position.set(0, 5, 8);
    } else {
      // First person - camera at player eye level
      camera.position.set(0, 2, 0);
    }
  }, [viewMode, camera]);

  return (
    <group ref={playerRef}>
      {/* Only show gun in FPS mode */}
      {viewMode === 'fps' && <Gun weaponType={selectedWeapon} />}
      
      {/* Show player body in TPS mode */}
      {viewMode === 'tps' && (
        <group position={[0, 0, 0]}>
          {/* Player body */}
          <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[0.6, 1.8, 0.3]} />
            <meshStandardMaterial color="#4a5d23" />
          </mesh>
          
          {/* Player head */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color="#d2b48c" />
          </mesh>
          
          {/* Player arms */}
          <mesh position={[-0.4, 1.2, 0]} castShadow>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color="#4a5d23" />
          </mesh>
          
          <mesh position={[0.4, 1.2, 0]} castShadow>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color="#4a5d23" />
          </mesh>
          
          {/* Player legs */}
          <mesh position={[-0.2, 0.3, 0]} castShadow>
            <boxGeometry args={[0.2, 0.6, 0.2]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          
          <mesh position={[0.2, 0.3, 0]} castShadow>
            <boxGeometry args={[0.2, 0.6, 0.2]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          
          {/* Weapon in hand for TPS */}
          <Gun weaponType={selectedWeapon} />
        </group>
      )}
      
      {bullets.map(bullet => (
        <Bullet 
          key={bullet.id} 
          bullet={bullet} 
          playerPosition={camera.position}
        />
      ))}
    </group>
  );
}
