import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import Player from "./Player";
import Environment from "./Environment";
import Lights from "./Lights";
import { useGameState } from "../lib/stores/useGameState";

export default function Game() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();
  const { initializeEnemies, gameMode } = useGameState();

  // Initialize the game
  useEffect(() => {
    console.log("Game initialized");
    initializeEnemies(gameMode);
  }, [initializeEnemies, gameMode]);

  // Lock pointer on click
  useEffect(() => {
    const handleClick = () => {
      if (controlsRef.current) {
        controlsRef.current.lock();
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [gl]);

  return (
    <>
      <PointerLockControls ref={controlsRef} />
      <Lights />
      <Environment />
      <Player camera={camera} />
    </>
  );
}
