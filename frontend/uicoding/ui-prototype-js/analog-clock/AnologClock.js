import { useEffect, useState } from "react";
import styles from "./Clock.module.css";

export default function AnalogClock() {
  // Store current time in component state.
  // Re-rendering every second updates the clock hands.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Create a timer that updates the current time every second.
    const timerId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    // Cleanup prevents memory leaks when component unmounts.
    return () => window.clearInterval(timerId);
  }, []);

  // Extract time units from current date.
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours() % 12;

  /**
   * Clock angle calculations:
   *
   * Full circle = 360°
   * 12 hours = 360° => 30° per hour
   * 60 minutes = 360° => 6° per minute
   * 60 seconds = 360° => 6° per second
   *
   * We also add partial movement so the hands move smoothly.
   */
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <div className="wrapper">
      <div className="clock">
        {/* Render clock numbers 1-12 */}
        {Array.from({ length: 12 }, (_, index) => {
          const number = index + 1;
          const angle = number * 30;

          return (
            <div
              key={number}
              className="number"
              style={{
                // Rotate each number to its clock position.
                transform: `rotate(${angle}deg)`,
              }}
            >
              <span
                style={{
                  // Counter-rotate so text remains upright.
                  transform: `rotate(${-angle}deg)`,
                }}
              >
                {number}
              </span>
            </div>
          );
        })}

        {/* Hour hand */}
        <div
          className="hand hour"
          style={{
            transform: `rotate(${hourDeg}deg)`,
          }}
        />

        {/* Minute hand */}
        <div
          className="hand minute"
          style={{
            transform: `rotate(${minuteDeg}deg)`,
          }}
        />

        {/* Second hand */}
        <div
          className="hand second"
          style={{
            transform: `rotate(${secondDeg}deg)`,
          }}
        />

        {/* Center pivot point */}
        <div className="center" />
      </div>
    </div>
  );
}
