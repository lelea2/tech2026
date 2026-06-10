import { useState, useEffect } from "react";
import './ProgressBar.css';

function ProgressBar({ isActive, onComplete }) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setFilled(false);
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
  const [activeIndex, setActiveIndex] = useState(0);

  function addProgressBar() {
    setBars((prev) => [...prev, crypto.randomUUID()]);
  }

  function handleComplete(index) {
    if (index === activeIndex) {
      setActiveIndex((prev) => prev + 1);
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
            isActive={index <= activeIndex}
            onComplete={() => handleComplete(index)}
          />
        ))}
      </div>
    </div>
  );
}
