import { useState } from "react";
import styles from "./styles.module.css";

const CELLS = Array.from({ length: 9 }, (_, i) => i).filter((i) => i !== 4);

export default function App() {
  const [activeCells, setActiveCells] = useState([]);
  const [isDeactivating, setIsDeactivating] = useState(false);

  function handleClick(index) {
    if (isDeactivating || activeCells.includes(index)) return;

    const nextActiveCells = [...activeCells, index];
    setActiveCells(nextActiveCells);

    if (nextActiveCells.length === CELLS.length) {
      deactivateCells(nextActiveCells);
    }
  }

  function deactivateCells(cells) {
    setIsDeactivating(true);

    cells
      .slice()
      .reverse()
      .forEach((cell, i) => {
        setTimeout(() => {
          setActiveCells((prev) => prev.filter((item) => item !== cell));

          if (i === cells.length - 1) {
            setIsDeactivating(false);
          }
        }, (i + 1) * 300);
      });
  }

  return (
    <div className="grid">
      {Array.from({ length: 9 }, (_, index) => {
        if (index === 4) {
          return <div key={index} className="cell" />;
        }

        const isActive = activeCells.includes(index);

        return (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={[
              "cell",
              // "w-80 h-80 rounded-lg border transition-colors duration-200",
              isActive
                ? "bg-orange-500 border-orange-400"
                : "inactive_cell",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
