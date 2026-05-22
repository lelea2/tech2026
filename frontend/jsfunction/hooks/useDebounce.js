// Implement a useDebounce hook that delays state updates until a specified delay has passed without any further changes to the provided value.

import {useRef, useEffect} from 'react';
/**
 * @template T
 * @param {T} value
 * @param {number} delay
 */
import {useRef, useEffect, useState} from 'react';

export default function useDebounce(value, delay) {
  const timeoutRef = useRef();
  const [currValue, setCurrValue] = useState(value);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setCurrValue(value);
      timeoutRef.current = null;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return currValue;
}