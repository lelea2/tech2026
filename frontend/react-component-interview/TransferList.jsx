import { useState } from "react";

const initialLeft = ["HTML", "CSS", "JavaScript", "React"];
const initialRight = ["Node", "Express", "MongoDB", "TypeScript"];

export default function TransferList() {
  const [left, setLeft] = useState(initialLeft);
  const [right, setRight] = useState(initialRight);
  const [checked, setChecked] = useState(new Set());

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

  const moveAllRight = () => {
    setRight((prev) => [...prev, ...left]);
    setLeft([]);
  };

  const moveAllLeft = () => {
    setLeft((prev) => [...prev, ...right]);
    setRight([]);
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

  const hasLeftChecked = left.some((item) => checked.has(item));
  const hasRightChecked = right.some((item) => checked.has(item));

  return (
    <div className="flex items-center gap-4 transfer-list">
      <List items={left} checked={checked} onToggle={toggleChecked} />

      <div className="flex flex-col gap-2 buttons">
        <button onClick={moveAllRight} disabled={left.length === 0}>
          &gt;&gt;
        </button>
        <button onClick={moveSelectedRight} disabled={!hasLeftChecked}>
          &gt;
        </button>
        <button onClick={moveSelectedLeft} disabled={!hasRightChecked}>
          &lt;
        </button>
        <button onClick={moveAllLeft} disabled={right.length === 0}>
          &lt;&lt;
        </button>
      </div>

      <List items={right} checked={checked} onToggle={toggleChecked} />
      <div className="flex flex-row gap-4">
        <div>
          {left.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
        <div>
          {right.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sharable list components
function List({ items, checked, onToggle }) {
  return (
    <ul className="list">
      {items.map((item) => (
        <li key={item}>
          <label>
            <input
              type="checkbox"
              checked={checked.has(item)}
              onChange={() => onToggle(item)}
            />
            {item}
          </label>
        </li>
      ))}
    </ul>
  );
}
