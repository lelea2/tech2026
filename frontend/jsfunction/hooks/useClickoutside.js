// Implement a useClickOutside hook that detects clicks outside of a specified element.

/**
 * @template T
 * @param {import("react").RefObject<T>} ref
 * @param {(event) => void} handler
 * @param {'mousedown' | 'touchstart' | undefined} eventType
 * @param {boolean | AddEventListenerOptions | undefined} eventListenerOptions
 */

import {useCallback, useEffect} from 'react';

export default function useClickOutside(
  ref,
  handler,
  eventType = 'mousedown',
  eventListenerOptions = {},
) {
  const handleEvent = useCallback((event) => {
    // current dom not contains the current cursor target
    if(ref.current && !ref.current.contains(event.target)) {
      handler(event);
    }
  }, [ref, handler]);

  useEffect(() => {
    document.addEventListener(eventType, handleEvent, eventListenerOptions);
    return () => {
      document.removeEventListener(eventType, handleEvent);
    };
  }, [handleEvent]);
}