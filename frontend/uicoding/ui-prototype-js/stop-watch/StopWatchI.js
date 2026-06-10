import { useEffect, useRef, useState } from "react";

export default function Stopwatch() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const startTimeRef = useRef(0);
  const accumulatedTimeRef = useRef(0);

  function toggleTimer() {
    if (isRunning) {
      accumulatedTimeRef.current += Date.now() - startTimeRef.current;
      setIsRunning(false);
    } else {
      startTimeRef.current = Date.now();
      setIsRunning(true);
    }
  }

  function resetTimer() {
    setIsRunning(false);
    setElapsedSeconds(0);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = 0;
  }

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      const elapsedMs =
        accumulatedTimeRef.current +
        (Date.now() - startTimeRef.current);

      setElapsedSeconds(Math.floor(elapsedMs / 1000));
    }, 100);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  function formatTime(totalSeconds) {
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return (
    <div>
      <h1
        onClick={toggleTimer}
        style={{
          cursor: "pointer",
          fontFamily: "monospace",
          fontSize: "48px",
        }}
      >
        {formatTime(elapsedSeconds)}
      </h1>

      <div className="controls">
          <button onClick={toggleTimer}>
            {isRunning ? "Stop" : "Start"}
          </button>

          <button onClick={resetTimer}>Reset</button>
        </div>
    </div>
  );
}
