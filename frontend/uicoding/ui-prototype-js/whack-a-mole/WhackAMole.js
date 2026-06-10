import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

const HOLES = 9;
const GAME_TIME = 15;
const MOLE_LIFETIME = 1500;
const SPAWN_INTERVAL = 900;

export default function App() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [activeMoles, setActiveMoles] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const moleTimersRef = useRef(new Map());
  const spawnTimerRef = useRef(undefined);
  const gameTimerRef = useRef(undefined);

  const removeMole = (holeIndex) => {
    setActiveMoles((prev) => prev.filter((h) => h !== holeIndex));
    moleTimersRef.current.delete(holeIndex);
  };

  const spawnNextMole = () => {
    setActiveMoles((prev) => {
      const available = Array.from({ length: HOLES }, (_, i) => i).filter(
        (h) => !prev.includes(h),
      );
      if (available.length === 0) return prev;

      const hole = available[Math.floor(Math.random() * available.length)];
      const timer = setTimeout(() => removeMole(hole), MOLE_LIFETIME);
      moleTimersRef.current.set(hole, timer);
      return [...prev, hole];
    });

    spawnTimerRef.current = setTimeout(spawnNextMole, SPAWN_INTERVAL);
  };

  const clearAllMoleTimers = () => {
    moleTimersRef.current.forEach((timer) => clearTimeout(timer));
    moleTimersRef.current.clear();
    clearTimeout(spawnTimerRef.current);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_TIME);
    setActiveMoles([]);
    setIsPlaying(true);
    spawnNextMole();
  };

  const endGame = () => {
    setIsPlaying(false);
    setActiveMoles([]);
    clearAllMoleTimers();
    clearInterval(gameTimerRef.current);
  };

  const whackMole = (holeIndex) => {
    if (!isPlaying || !activeMoles.includes(holeIndex)) return;

    clearTimeout(moleTimersRef.current.get(holeIndex));
    moleTimersRef.current.delete(holeIndex);
    setActiveMoles((prev) => prev.filter((h) => h !== holeIndex));
    setScore((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isPlaying) return;

    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(gameTimerRef.current);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      clearAllMoleTimers();
      clearInterval(gameTimerRef.current);
    };
  }, []);

  return (
    <main className="app">
      <h1>Whack-a-Mole</h1>

      <div className="stats">
        <p>Score: {score}</p>
        <p>Time: {timeLeft}s</p>
      </div>

      <div className="board">
        {Array.from({ length: HOLES }).map((_, index) => (
          <button
            key={index}
            className="hole"
            onClick={() => whackMole(index)}
            disabled={!isPlaying}
          >
            {activeMoles.includes(index) && <span className="mole">🐹</span>}
          </button>
        ))}
      </div>

      {!isPlaying && (
        <button className="startBtn" onClick={startGame}>
          {timeLeft === 0 ? "Play Again" : "Start Game"}
        </button>
      )}
    </main>
  );
}
