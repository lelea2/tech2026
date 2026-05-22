import {useCallback, useState} from 'react';

/**
 * @template T
 * @param {T[]} defaultValue
 */
export default function useArray(defaultValue) {
  const [array, set] = useState(defaultValue);

  const push = useCallback((item) => {
    set((prev) => [...prev, item]);
  }, []);

  const remove = useCallback((index) => {
    set((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const filter = useCallback((predicate) => {
    set((prev) => prev.filter(predicate));
  }, []);

  const update = useCallback((index, newItem) => {
    set((prev) => prev.map((item, i) => (i === index ? newItem : item)));
  }, []);

  const clear = useCallback(() => {
    set([]);
  }, []);

  return {array, set, push, remove, filter, update, clear};
}
