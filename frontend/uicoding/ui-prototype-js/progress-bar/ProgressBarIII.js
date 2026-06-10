import { useState, useEffect } from "react";
import './ProgressBar.css';

const MAX_CONCURRENT = 3;
function ProgressBar({ isActive, onComplete }) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const id = requestAnimationFrame(() => {
      setFilled(true);
    });
    return () => cancelAnimationFrame(id);
  }, [isActive]);


  return (
    <div className="progress">
      <div
        className={`progress-fill ${filled ? "filled" : ""}`}
        onTransitionEnd={onComplete}
      />
    </div>
  );
}

export default function App() {
  const [bars, setBars] = useState([]);
  const [completeCount, setCompleteCount] = useState(0);

  function addProgressBar() {
    setBars((prev) => [...prev, crypto.randomUUID()]);
  }

  function handleComplete(index) {
    if (index === completeCount) {
      setCompleteCount((prev) => prev + 1);
    }
  }

  return (
    <div>
      <p className="text-slate-400 text-sm mb-4">
        Wait for the animation to complete before adding a new one.
      </p>
      <button
        onClick={addProgressBar}
        className="px-4 py-1.5 text-sm border border-slate-500 rounded hover:border-slate-300 hover:text-white transition-colors"
      >
        Add
      </button>

      <div className="progress-bars">
        {bars.map((id, index) => (
          <ProgressBar
            key={id}
            isActive={index >= completeCount && index < completeCount + MAX_CONCURRENT}
            onComplete={() => handleComplete(index)}
          />
        ))}
      </div>
    </div>
  );
}
