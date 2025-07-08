// src/components/Soldier.tsx
import { useGLTF } from "@react-three/drei";

export default function Soldier(props: any) {
  const { scene } = useGLTF("models/soldier.glb"); // path to your model

  return (
    <primitive
      object={scene}
      scale={1}
      position={[0, 0, 0]}
      rotation={[0, Math.PI, 0]}
      {...props}
    />
  );
}
