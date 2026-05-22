/**
 * @template T
 * @param {T | (() => T)} [initialStateOrInitializer]
 * @returns {[T | undefined, import('react').Dispatch<import('react').SetStateAction<T | undefined>>, () => void]}
 */

import {useState, useCallback} from 'react';

export default function useStateWithReset(initialStateOrInitializer) {
  // set initialize as state to make sure it always get the latest value when useStateWithReset being called. 
  const [initializer] = useState(initialStateOrInitializer);
  const [value, setValue] = useState(initializer);
  
  const resetValue = useCallback(() => {
    setValue(initializer);
  }, [initializer]);

  return [
    value,
    setValue,
    resetValue
  ];
}