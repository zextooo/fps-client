import { useRef, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
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

  // Load soldier and gun models
  const soldier = useLoader(GLTFLoader, "models/soldier.glb");
  const gun = useLoader(GLTFLoader, "models/pistol.glb"); // or rifle.glb

  useEffect(() => {
    const soldierScene = soldier.scene;
    const gunScene = gun.scene;

    // Tweak gun size and orientation
    gunScene.scale.set(0.5, 0.5, 0.5);
    gunScene.rotation.set(0, Math.PI, 0);
    gunScene.position.set(0, 0, 0);

    // Attach gun to soldier's hand bone
    const hand = soldierScene.getObjectByName("mixamorigRightHand");
    if (hand) {
      hand.add(gunScene);
    } else {
      console.warn("Right hand bone not found in soldier model.");
    }
  }, [soldier, gun]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0 && ammo > 0 && !isReloading) {
        shoot();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyR' && !isReloading && ammo < 30) {
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
      life: 3000
    });
    
    playHit();
  };

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const keys = getKeys();
    directionRef.current.set(0, 0, 0);
    
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    const rightDirection = new THREE.Vector3();
    rightDirection.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
    
    if (keys.forward) directionRef.current.add(cameraDirection);
    if (keys.backward) directionRef.current.sub(cameraDirection);
    if (keys.leftward) directionRef.current.sub(rightDirection);
    if (keys.rightward) directionRef.current.add(rightDirection);
    
    if (directionRef.current.length() > 0) {
      directionRef.current.normalize();
      directionRef.current.multiplyScalar(moveSpeed);
    }

    velocityRef.current.x = directionRef.current.x;
    velocityRef.current.z = directionRef.current.z;

    if (keys.jump && isGrounded.current) {
      velocityRef.current.y = jumpForce;
      isGrounded.current = false;
    }

    velocityRef.current.y += gravity * delta;

    const newPosition = camera.position.clone();
    newPosition.add(velocityRef.current.clone().multiplyScalar(delta));

    if (newPosition.y <= 2) {
      newPosition.y = 2;
      velocityRef.current.y = 0;
      isGrounded.current = true;
    }

    camera.position.copy(newPosition);

    bullets.forEach(bullet => {
      enemies.forEach(enemy => {
        const distance = bullet.position.distanceTo(enemy.position);
        if (distance < 1.5) {
          removeEnemy(enemy.id);
          addScore(10);
          playHit();
        }
      });
    });
  });

  useEffect(() => {
    if (viewMode === 'tps') {
      camera.position.set(0, 5, 8);
    } else {
      camera.position.set(0, 2, 0);
    }
  }, [viewMode, camera]);

  return (
    <group ref={playerRef}>
      {/* FPS mode: gun in camera */}
      {viewMode === 'fps' && <Gun weaponType={selectedWeapon} />}

      {/* TPS mode: show soldier model */}
      {viewMode === 'tps' && (
        <primitive
          object={soldier.scene}
          position={[0, 0, 0]}
          scale={[1, 1, 1]}
        />
      )}

      {/* Render all active bullets */}
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
