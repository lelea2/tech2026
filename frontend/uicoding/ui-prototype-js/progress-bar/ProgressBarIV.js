import { useEffect, useMemo, useState } from "react";
import "./ProgressBarIV.css";

const DURATION = 2000;
const CONCURRENCY_LIMIT = 3;

function ProgressBar({ progress }) {
  return (
    <div className="progress">
      <div
        className="progress-fill"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

function createBar() {
  return {
    id: crypto.randomUUID(),
    progress: 0,
    completed: false,
  };
}

export default function App() {
  const [bars, setBars] = useState([createBar()]);
  const [isPlaying, setIsPlaying] = useState(false);

  function addBar() {
    setBars((prev) => [...prev, createBar()]);
  }

  function reset() {
    setIsPlaying(false);
    setBars([createBar()]);
  }

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    let frameId;
    let previousTime = performance.now();

    function animate(currentTime) {
      const delta = currentTime - previousTime;
      previousTime = currentTime;

      setBars((prevBars) => {
        const activeIndexes = [];

        for (let i = 0; i < prevBars.length; i++) {
          if (
            !prevBars[i].completed &&
            activeIndexes.length < CONCURRENCY_LIMIT
          ) {
            activeIndexes.push(i);
          }
        }

        return prevBars.map((bar, index) => {
          if (!activeIndexes.includes(index)) {
            return bar;
          }

          const nextProgress = Math.min(
            100,
            bar.progress + (delta / DURATION) * 100
          );

          return {
            ...bar,
            progress: nextProgress,
            completed: nextProgress >= 100,
          };
        });
      });

      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isPlaying]);

  const state = useMemo(
    () => ({
      isProgressing: isPlaying,
      progression: bars.map((bar) =>
        Number(bar.progress.toFixed(1))
      ),
    }),
    [bars, isPlaying]
  );

  return (
    <div className="container">
      <div className="controls">
        <button onClick={() => setIsPlaying((prev) => !prev)}>
          {isPlaying ? "Pause" : "Start"}
        </button>

        <button onClick={addBar}>Add</button>

        <button onClick={reset}>Reset</button>
      </div>

      <div className="bars">
        {bars.map((bar) => (
          <ProgressBar
            key={bar.id}
            progress={bar.progress}
          />
        ))}
      </div>

      <pre className="state-preview">
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}
