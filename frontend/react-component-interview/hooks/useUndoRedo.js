import React, {react, useCallback} from "react";

export function useUndoRedo(initialValue) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initialValue);
  const [future, setFuture] = useState([]);

  const set = useCallback((nextValue) => {
    setPresent((current) => {
      const resolved =
        typeof nextValue === "function" ? nextValue(current) : nextValue;

      setPast((prevPast) => [...prevPast, current]);
      setFuture([]);

      return resolved;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((currentPast) => {
      if (currentPast.length === 0) return currentPast;

      const previous = currentPast[currentPast.length - 1];
      const newPast = currentPast.slice(0, -1);

      setFuture((currentFuture) => [present, ...currentFuture]);
      setPresent(previous);

      return newPast;
    });
  }, [present]);

  const redo = useCallback(() => {
    setFuture((currentFuture) => {
      if (currentFuture.length === 0) return currentFuture;

      const next = currentFuture[0];
      const newFuture = currentFuture.slice(1);

      setPast((currentPast) => [...currentPast, present]);
      setPresent(next);

      return newFuture;
    });
  }, [present]);

  const reset = useCallback(
    (nextValue = initialValue) => {
      setPast([]);
      setPresent(nextValue);
      setFuture([]);
    },
    [initialValue]
  );

  return {
    value: present,
    set,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    past,
    future,
  };
}

function TextEditor() {
  const editor = useUndoRedo("");

  return (
    <div>
      <textarea
        value={editor.value}
        onChange={(e) => editor.set(e.target.value)}
      />

      <button onClick={editor.undo} disabled={!editor.canUndo}>
        Undo
      </button>

      <button onClick={editor.redo} disabled={!editor.canRedo}>
        Redo
      </button>
    </div>
  );
}