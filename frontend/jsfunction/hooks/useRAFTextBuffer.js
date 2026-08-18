import { useRef, useCallback, useEffect } from "react";

function useRafTextBuffer(
  onFlush: (text: string) => void,
) {
  const bufferRef = useRef("");
  const rafRef = useRef<number | null>(null);
  const callbackRef = useRef(onFlush);

  callbackRef.current = onFlush;

  const flush = useCallback(() => {
    rafRef.current = null;

    const value = bufferRef.current;
    bufferRef.current = "";

    if (value) {
      callbackRef.current(value);
    }
  }, []);

  const push = useCallback(
    (delta: string) => {
      bufferRef.current += delta;

      if (rafRef.current === null) {
        rafRef.current =
          requestAnimationFrame(flush);
      }
    },
    [flush],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(
          rafRef.current,
        );
      }
    };
  }, []);

  return {
    push,
    flush,
  };
}