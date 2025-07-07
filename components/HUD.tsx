import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";

export default function HUD() {
  const { score, ammo, maxAmmo, enemies, isReloading, playerHealth, maxHealth, gameMode, viewMode, selectedWeapon } = useGameState();
  const { isMuted, toggleMute } = useAudio();

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-6 h-6 pointer-events-none">
          {/* Horizontal line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white transform -translate-y-1/2"></div>
          {/* Vertical line */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white transform -translate-x-1/2"></div>
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      {/* Top HUD */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded pointer-events-auto">
        <div className="text-xl font-bold mb-2">Score: {score}</div>
        <div className="text-lg mb-2">
          Ammo: {ammo}/{maxAmmo}
          {isReloading && <span className="text-yellow-400 ml-2">Reloading...</span>}
        </div>
        <div className="text-sm mb-2">Enemies: {enemies.length}</div>
        {gameMode === '1v1' && (
          <div className="text-sm">
            Health: 
            <div className="w-20 h-2 bg-gray-600 rounded mt-1">
              <div 
                className="h-full bg-red-500 rounded transition-all"
                style={{ width: `${(playerHealth / maxHealth) * 100}%` }}
              />
            </div>
          </div>
        )}
        <div className="text-xs mt-2 text-gray-400">Mode: {gameMode.toUpperCase()}</div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded max-w-xs">
        <div className="text-sm">
          <div className="mb-1"><strong>WASD:</strong> Move</div>
          <div className="mb-1"><strong>Mouse:</strong> Look around</div>
          <div className="mb-1"><strong>Left Click:</strong> Shoot</div>
          <div className="mb-1"><strong>Space:</strong> Jump</div>
          <div className="mb-1"><strong>R:</strong> Reload</div>
          <div className="mb-1"><strong>V:</strong> Toggle FPS/TPS</div>
          <div className="mb-1"><strong>M:</strong> {isMuted ? "Unmute" : "Mute"}</div>
        </div>
      </div>

      {/* Audio control */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={toggleMute}
          className="bg-black/70 text-white px-4 py-2 rounded pointer-events-auto hover:bg-black/90 transition-colors"
        >
          {isMuted ? "🔇 Muted" : "🔊 Sound On"}
        </button>
      </div>

      {/* Game status */}
      {enemies.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600/90 text-white text-center p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Victory!</h2>
          <p className="text-xl">All enemies eliminated!</p>
          <p className="text-lg mt-2">Final Score: {score}</p>
        </div>
      )}

      {ammo === 0 && enemies.length > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600/90 text-white text-center p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Out of Ammo!</h2>
          <p className="text-xl">Reload needed</p>
        </div>
      )}
    </div>
  );
}
