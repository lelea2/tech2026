import {useMemo, useState} from 'react';
import './GuestCounter.css';

const LIMITS = {
  adults: {min: 1, max: 6},
  children: {min: 0, max: 4},
  pets: {min: 0, max: 2},
};

export default function GuestCounter() {
  const [counts, setCounts] = useState({adults: 1, children: 0, pets: 0});

  const update = (key, delta) => {
    setCounts((prev) => {
      const min = LIMITS[key].min;
      const max = LIMITS[key].max;
      const next = Math.min(max, Math.max(min, prev[key] + delta));
      return {...prev, [key]: next};
    });
  };

  const total = useMemo(() => counts.adults + counts.children + counts.pets, [counts]);

  return (
    <div className="guest-counter">
      <h3>Guest Counter</h3>
      {Object.keys(counts).map((key) => (
        <div key={key} className="row">
          <span>{key}</span>
          <div>
            <button onClick={() => update(key, -1)}>-</button>
            <strong>{counts[key]}</strong>
            <button onClick={() => update(key, 1)}>+</button>
          </div>
        </div>
      ))}
      <p>Total guests: {total}</p>
    </div>
  );
}
