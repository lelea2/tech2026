// Implement a useObject hook that manages a state of JavaScript Object, 
// //also known as POJO (Plain Old JavaScript Object), which is a key-value pair storage initialized with {}.

/**
 * @template T
 * @param {T} initialValue
 */
import {useState, useCallback} from 'react';

export default function useObject(initialValue) {
  const [data, setData] = useState(initialValue);

  const setRecord = useCallback((value) => {
    setData((prev) => {
      const nextValue = typeof value === 'function' ? value(prev) : value;
      return {
        ...prev,
        ...nextValue,
      };
    })
  }, []);

  return [data, setRecord];
}

/**
 * export default function Component() {
  const [record, setRecord] = useObject({ a: 1, b: 2 });

  return (
    <div>
      <pre>{JSON.stringify(record, null, 2)}</pre>
      <button onClick={() => setRecord((prev) => ({ a: prev.a + 1 }))}>
        Increase a
      </button>
      <button onClick={() => setRecord((prev) => ({ b: prev.b + 1 }))}>
        Increase b
      </button>
      <button onClick={() => setRecord(() => ({ c: 3 }))}>Add c</button>
    </div>
  );
}
 */