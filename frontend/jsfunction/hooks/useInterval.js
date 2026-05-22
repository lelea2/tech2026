/**
 * @param {() => void} callback
 * @param {number | null} delay
 */
import {useEffect, useRef} from 'react';

export default function useInterval(callback, delay) {
  // avoid recalling on rerender
  const savedCallback = useRef(callback);

  // Keep latest callback reference
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay == null) {
      return;
    }
    const id = setInterval(savedCallback.current, delay);

    return () => clearInterval(id);
  }, [savedCallback, delay]);
}