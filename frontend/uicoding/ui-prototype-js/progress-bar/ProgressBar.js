import {useEffect, useState} from 'react';
import './ProgressBar.css';

function ProgressBar() {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setFilled(true);
    });
    return () => cancelAnimationFrame(id);
  });

  return (
    <div className="progress">
      <div className={`progress-fill ${filled ? ' filled' : ''}`} />
    </div>
  )
}
export default function App() {
  const [bars, setBars] = useState([]);

  function addProgressBar() {
    setBars((prev) => [...prev, Date.now() + Math.random()]);
  }

  return (
    <div>
      <p className="text-slate-400 text-sm mb-4">
        This is a simple progress bar component that shows the progress of an operation.
      </p>
      <button
        onClick={addProgressBar}
        className="px-4 py-1.5 text-sm border border-slate-500 rounded hover:border-slate-300 hover:text-white transition-colors"
      >
        Add
      </button>
      <div className="progress-bars">
        {bars.map((id) => (
          <ProgressBar key={id} />
        ))}
      </div>
    </div>
  );
}
