// Core idea: use performance.now() + requestAnimationFrame for smooth millisecond updates.
import { useEffect, useRef, useState } from "react";
import "./Stopwatch.css";

function formatTime(ms) {
  const milliseconds = Math.floor(ms % 1000);
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  // return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
  //   2,
  //   "0"
  // )}:${String(seconds).padStart(2, "0")}`;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(
    3,
    "0"
  )}`;
}

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0); // reset
  const [isRunning, setIsRunning] = useState(false); // clock is counting

  const startTimeRef = useRef(0);
  const savedElapsedRef = useRef(0);

  function toggleTimer() {
    setIsRunning((prev) => !prev);
  }

  function resetTimer() {
    setIsRunning(false);
    setElapsed(0);
    savedElapsedRef.current = 0;
  }

  useEffect(() => {
    if (!isRunning) {
      savedElapsedRef.current = elapsed;
      return;
    }

    startTimeRef.current = performance.now() - savedElapsedRef.current;

    let frameId;

    function tick(now) {
      setElapsed(now - startTimeRef.current);
      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [isRunning, elapsed]);

  return (
    <div className="stopwatch">
      <button
        className="timer"
        onClick={toggleTimer}
        aria-label={isRunning ? "Stop timer" : "Start timer"}
      >
        {formatTime(elapsed)}
      </button>

      <div className="controls">
        <button onClick={toggleTimer}>
          {isRunning ? "Stop" : "Start"}
        </button>

        <button onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
}
