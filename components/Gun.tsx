import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface GunProps {
  weaponType?: string;
}

export default function Gun({ weaponType = 'rifle' }: GunProps) {
  const gunRef = useRef<THREE.Group>(null);
  const recoilRef = useRef(0);
  const [currentWeapon, setCurrentWeapon] = useState(weaponType);
  
  // Load 3D models
  const rifleModel = useGLTF('/models/rifle.glb');
  const pistolModel = useGLTF('/models/pistol.glb');
  
  useEffect(() => {
    setCurrentWeapon(weaponType);
  }, [weaponType]);

  useFrame((state, delta) => {
    if (!gunRef.current) return;
    
    // Simple idle animation
    const time = state.clock.elapsedTime;
    gunRef.current.position.y = Math.sin(time * 2) * 0.005;
    
    // Recoil animation
    if (recoilRef.current > 0) {
      gunRef.current.position.z = -0.1 + (recoilRef.current * 0.05);
      recoilRef.current -= delta * 10;
    } else {
      gunRef.current.position.z = -0.1;
      recoilRef.current = 0;
    }
  });

  // Trigger recoil on mouse click
  const handleRecoil = () => {
    recoilRef.current = 1;
  };
  
  // Select the appropriate model
  const getWeaponModel = () => {
    switch (currentWeapon) {
      case 'pistol':
        return pistolModel.scene.clone();
      case 'ak47':
      case 'awm':
      case 'shotgun':
      default:
        return rifleModel.scene.clone();
    }
  };

  const weaponModel = getWeaponModel();
  
  return (
    <group 
      ref={gunRef} 
      position={[0.5, -0.4, -0.8]}
      rotation={[0, 0, 0]}
      onClick={handleRecoil}
    >
      {/* Use 3D model if available, otherwise fallback to basic geometry */}
      {weaponModel ? (
        <primitive 
          object={weaponModel} 
          scale={[0.8, 0.8, 0.8]} 
          position={[0, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
      ) : (
        <>
          {/* Enhanced visible gun geometry */}
          {/* Gun barrel */}
          <mesh position={[0, 0.1, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.6, 12]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
          </mesh>
          
          {/* Gun body */}
          <mesh position={[0, 0, -0.1]}>
            <boxGeometry args={[0.12, 0.15, 0.4]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.3} />
          </mesh>
          
          {/* Gun stock */}
          <mesh position={[0, -0.1, 0.15]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.08, 0.2, 0.15]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          
          {/* Trigger guard */}
          <mesh position={[0, -0.1, 0.05]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.04, 0.01, 8, 16]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          
          {/* Front sight */}
          <mesh position={[0, 0.08, -0.7]}>
            <boxGeometry args={[0.01, 0.03, 0.01]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          
          {/* Scope/rear sight */}
          <mesh position={[0, 0.08, -0.1]}>
            <boxGeometry args={[0.02, 0.04, 0.06]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
        </>
      )}
    </group>
  );
}

// Preload the models
useGLTF.preload('/models/rifle.glb');
useGLTF.preload('/models/pistol.glb');
