import { useState } from "react";

const initialLeft = ["HTML", "CSS", "JavaScript", "React"];
const initialRight = ["Node", "Express", "MongoDB", "TypeScript"];

export default function TransferList() {
  const [left, setLeft] = useState(initialLeft);
  const [right, setRight] = useState(initialRight);
  const [checked, setChecked] = useState(new Set());
  const [leftValue, setLeftValue] = useState("");
  const [rightValue, setRightValue] = useState("");

  const toggleChecked = (item) => {
    setChecked((prev) => {
      const next = new Set(prev);

      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }

      return next;
    });
  };

  // Select all items from the left list and move them to the right
  const moveSelectedRight = () => {
    const selected = left.filter((item) => checked.has(item));
    const remaining = left.filter((item) => !checked.has(item));

    setRight((prev) => [...prev, ...selected]);
    setLeft(remaining);
  };

  // Select all items from the right list and move them to the left
  const moveSelectedLeft = () => {
    const selected = right.filter((item) => checked.has(item));
    const remaining = right.filter((item) => !checked.has(item));

    setLeft((prev) => [...prev, ...selected]);
    setRight(remaining);
  };

  const handleLeftFormSubmit = (e) => {
    e.preventDefault();
    if (leftValue) {
      setLeft((prev) => [...prev, leftValue]);
      setLeftValue("");
    }
  };

  const handleRightFormSubmit = (e) => {
    e.preventDefault();
    if (rightValue) {
      setRight((prev) => [...prev, rightValue]);
      setRightValue("");
    }
  };

  const handleLeftFormChange = (e) => {
    const value = e.target.value;
    setLeftValue(value);
  };

  const handleRightFormChange = (e) => {
    const value = e.target.value;
    setRightValue(value);
  };


  const hasLeftChecked = left.some((item) => checked.has(item));
  const hasRightChecked = right.some((item) => checked.has(item));

  const panelClass = "flex flex-col gap-2 w-44 border border-slate-700 rounded-lg p-3 bg-slate-800/40";
  const inputClass = "w-full px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded focus:outline-none focus:border-orange-500 text-white placeholder-slate-500";
  const btnClass = "px-3 py-1 text-sm border border-slate-500 rounded hover:border-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center gap-4">
      <div className={panelClass}>
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Left List</p>
        <form onSubmit={handleLeftFormSubmit} className="flex gap-1">
          <input
            type="text"
            name="left"
            value={leftValue}
            onChange={handleLeftFormChange}
            placeholder="Add item…"
            className={inputClass}
          />
          <button type="submit" className={btnClass}>+</button>
        </form>
        <List items={left} checked={checked} onToggle={toggleChecked} />
      </div>

      <div className="flex flex-col gap-2">
        <button onClick={moveSelectedRight} disabled={!hasLeftChecked} className={btnClass}>&gt;</button>
        <button onClick={moveSelectedLeft} disabled={!hasRightChecked} className={btnClass}>&lt;</button>
      </div>

      <div className={panelClass}>
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Right List</p>
        <form onSubmit={handleRightFormSubmit} className="flex gap-1">
          <input
            type="text"
            name="right"
            value={rightValue}
            onChange={handleRightFormChange}
            placeholder="Add item…"
            className={inputClass}
          />
          <button type="submit" className={btnClass}>+</button>
        </form>
        <List items={right} checked={checked} onToggle={toggleChecked} />
      </div>
    </div>
  );
}

// Sharable list components
function List({ items, checked, onToggle }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item}>
          <label className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-slate-700 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={checked.has(item)}
              onChange={() => onToggle(item)}
              className="accent-orange-500"
            />
            {item}
          </label>
        </li>
      ))}
    </ul>
  );
}
