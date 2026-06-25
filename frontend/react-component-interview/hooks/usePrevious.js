import React, {useRef} from "react";

export function usePrevious(value) {
  const previousRef = useRef();

  useEffect(() => {
    previousRef.current = value;
  }, [value]);

  return previousRef.current;
}

// Example usage
function Counter() {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {previousCount}</p>

      <button onClick={() => setCount((count) => count + 1)}>
        Increment
      </button>
    </div>
  );
}