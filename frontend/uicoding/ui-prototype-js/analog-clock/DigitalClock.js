import { useEffect, useState } from 'react';
import styles from './styles.module.css';

// Classic 7-segment display: segments a–g arranged as top/top-right/bottom-right/bottom/bottom-left/top-left/middle.
const DIGIT_SEGMENTS = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'c', 'd', 'g'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
};

// Always returns a zero-padded 24h string in the fixed format "HH:MM:SS" (8 chars).
function getTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function Digit({ value }) {
  const activeSegments = DIGIT_SEGMENTS[value];

  // Always render all 7 segments and toggle `active` — keeps DOM structure stable for CSS transitions.
  return (
    <div className="digit">
      {['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((segment) => (
        <div
          key={segment}
          className={`segment ${segment} ${
            activeSegments.includes(segment) ? 'active' : ''
          }`}
        />
      ))}
    </div>
  );
}

function Colon() {
  return (
    <div className="colon">
      <span />
      <span />
    </div>
  );
}

export default function App() {
  const [time, setTime] = useState(getTime);

  useEffect(() => {
    let timeoutId;

    function tick() {
      setTime(getTime());
      // `Date.now() % 1000` = ms already elapsed in the current second; subtract from 1000 to hit the next boundary.
      timeoutId = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    }

    // Delay the first tick to the next second boundary instead of firing immediately to avoid setInterval drift.
    timeoutId = window.setTimeout(tick, 1000 - (Date.now() % 1000));

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <main className="page">
      <div className="clock" aria-label={`Current time is ${time}`}>
        {/* getTime() always returns "HH:MM:SS"; split on each char to route ':' to Colon and digits to Digit. */}
        {time.split('').map((char, index) =>
          char === ':' ? (
            <Colon key={index} />
          ) : (
            <Digit key={index} value={char} />
          ),
        )}
      </div>
    </main>
  );
}
