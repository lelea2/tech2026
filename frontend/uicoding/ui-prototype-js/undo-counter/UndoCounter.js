import { useState } from 'react';
import styles from './UndoableCounter.module.css';

function applyOperation(value, operation) {
  switch (operation) {
    case '/2':
      return value / 2;
    case '-1':
      return value - 1;
    case '+1':
      return value + 1;
    case 'x2':
      return value * 2;
    default:
      return value;
  }
}

export default function UndoableCounter() {
  const [count, setCount] = useState(0);

  // History of actions that have been applied.
  const [history, setHistory] = useState([]);

  // History of actions that were undone and can be redone.
  const [redoStack, setRedoStack] = useState([]); // LIFO

  const handleOperation = (operation) => {
    const before = count;
    const after = applyOperation(count, operation);

    const newHistoryItem = {
      operation,
      before,
      after,
    };

    setCount(after);
    setHistory((prev) => [...prev, newHistoryItem]);

    // Important: new action clears redo history.
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];

    setCount(lastAction.before);
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, lastAction]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const actionToRedo = redoStack[redoStack.length - 1];

    setCount(actionToRedo.after);
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, actionToRedo]);
  };

  const handleReset = () => {
    setCount(0);
    setHistory([]);
    setRedoStack([]);
  };

  return (
    <div className="container">
      <h1>Undoable Counter</h1>

      <div className="count">{count}</div>

      <div className="controls">
        <button className="button" onClick={() => handleOperation('/2')}>/2</button>
        <button className="button" onClick={() => handleOperation('-1')}>-1</button>
        <button className="button" onClick={() => handleOperation('+1')}>+1</button>
        <button className="button" onClick={() => handleOperation('x2')}>x2</button>
      </div>

      <div className="controls">
        <button className="button" onClick={handleUndo} disabled={history.length === 0}>
          Undo
        </button>

        <button className="button" onClick={handleRedo} disabled={redoStack.length === 0}>
          Redo
        </button>

        <button className="button" onClick={handleReset}>Reset</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Operation</th>
            <th>Before</th>
            <th>After</th>
          </tr>
        </thead>

        <tbody>
          {history.map((item, index) => (
            <tr key={index}>
              <td>{item.operation}</td>
              <td>{item.before}</td>
              <td>{item.after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
