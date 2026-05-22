/**
 * Implement a useIdle hook that detects user inactivity for a specified time. 
 * It listens for user interactions like mouse movements, keyboard presses, 
 * and touch events, and resets a timer whenever activity is detected.
 * We consider the user to be idle if there are no events of type events dispatched within ms milliseconds. 
 * Additionally, if the user has just switched from another tab to our tab (hint: the visibilitychange event), 
 * the user should not be considered idle.
 * 
 */
/**
 * @type {(keyof WindowEventMap)[]}
 */
const DEFAULT_EVENTS = [
  'mousemove',
  'mousedown',
  'click',
  'mouseover',
  'resize',
  'keydown',
  'touchstart',
  'wheel',
];

/**
 *
 * @param {number} ms
 * @param {boolean} initialState
 * @param {(keyof WindowEventMap)[]} events
 * @returns {boolean}
 */

import {useState, useEffect, useRef} from 'react';

export default function useIdle(
  ms = 60_000,
  initialState = false,
  events = DEFAULT_EVENTS,
) {
  const [isIdle, setIsIdle] = useState(initialState);
  const timerRef = useRef(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const resetTimer = () => {
      clearTimer();
      setIsIdle(false);
      timerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, ms);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimer();
        setIsIdle(true);
      } else {
        resetTimer();
      }
    };

    for (const event of events) {
      window.addEventListener(event, resetTimer);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    resetTimer();

    return () => {
      clearTimer();

      for (const event of events) {
        window.removeEventListener(event, resetTimer);
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [ms, events]);

  return isIdle;
}