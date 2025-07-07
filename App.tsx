import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { useGameState } from "./lib/stores/useGameState";
import Game from "./components/Game";
import HUD from "./components/HUD";
import SoundManager from "./components/SoundManager";
import Home from "./pages/Home";
import "@fontsource/inter";

// Define control keys for the FPS game
enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  jump = 'jump',
  shoot = 'shoot',
  viewToggle = 'viewToggle'
}

const controls = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.leftward, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.rightward, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.jump, keys: ["Space"] },
  { name: Controls.shoot, keys: ["Mouse0"] }, // Left click
  { name: Controls.viewToggle, keys: ["KeyV"] }, // V key for view toggle
];

// Main App component
function App() {
  const { toggleMute } = useAudio();
  const { setGameMode, setWeapon, reset } = useGameState();
  const [currentPage, setCurrentPage] = useState<'home' | 'game'>('home');

  const handleStartGame = (mode: 'practice' | '1v1', weapon: string) => {
    console.log(`Starting game in ${mode} mode with ${weapon}`);
    setGameMode(mode);
    setWeapon(weapon);
    reset();
    setCurrentPage('game');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    reset();
  };

  // Handle global key events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "KeyM") {
        toggleMute();
      }
      if (event.code === "Escape" && currentPage === 'game') {
        handleBackToHome();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [toggleMute, currentPage]);

  if (currentPage === 'home') {
    return <Home onStartGame={handleStartGame} />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        <Canvas
          shadows
          camera={{
            position: [0, 2, 5],
            fov: 75,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance"
          }}
          onCreated={({ gl }) => {
            gl.domElement.style.cursor = 'crosshair';
          }}
        >
          <color attach="background" args={["#87CEEB"]} />
          
          <Suspense fallback={null}>
            <Game />
          </Suspense>
        </Canvas>
        
        <HUD />
        <SoundManager />
        
        {/* Back to menu button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleBackToHome}
            className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded pointer-events-auto transition-colors"
          >
            Back to Menu (ESC)
          </button>
        </div>
      </KeyboardControls>
    </div>
  );
}

export default App;
