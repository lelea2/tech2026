import { useState } from "react";
import "./PixelArt.css";

const SIZE = 15;
const CELL_SIZE = 20;

const COLORS = [
  "#ffffff",
  "#e9ecef",
  "#000",
  "#cc0001",
  "#fb940b",
  "#ffff01",
  "#01cc00",
  "#38d9a9",
  "#228be6",
  "#7950f2",
  "#ff8787",
];

export default function PixelArt() {
  const [mode, setMode] = useState("draw");
  const [selectedColor, setSelectedColor] = useState("#000");
  const [isDragging, setIsDragging] = useState(false);

  // set up 2D array board for canvas
  const [pixels, setPixels] = useState(
    Array(SIZE * SIZE).fill(null)
  );

  function updatePixel(index) {
    setPixels((prev) => {
      const next = [...prev];

      if (mode === "draw") {
        next[index] = selectedColor;
      } else {
        next[index] = null;
      }

      return next;
    });
  }

  // Draw white/gray grid
  function getBaseColor(index) {
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    return (row + col) % 2 === 0 ? "#ffffff" : "#e9ecef";
  }

  return (
    <div className="pixel-art">
      {/* Draw/Erase mode toggle */}
      <div className="tabs">
        <button
          className={mode === "draw" ? "active" : ""}
          onClick={() => setMode("draw")}
        >
          Draw
        </button>

        <button
          className={mode === "erase" ? "active" : ""}
          onClick={() => setMode("erase")}
        >
          Erase
        </button>
      </div>

      {/* Color palette */}
      <div className="colors">
        {COLORS.map((color) => (
          <button
            key={color}
            aria-label={`Select ${color}`}
            className="color"
            style={{
              backgroundColor: color,
              border:
                selectedColor === color
                  ? "2px solid black"
                  : "1px solid #ccc",
            }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>

      {/* Canvas */}
      <div
        className="canvas"
        onMouseLeave={() => setIsDragging(false)}
        onMouseUp={() => setIsDragging(false)}
        style={{
          gridTemplateColumns: `repeat(${SIZE}, ${CELL_SIZE}px)`,
        }}
      >
        {pixels.map((color, index) => (
          <button
            key={index}
            className="cell"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: color ?? getBaseColor(index),
            }}
            onMouseDown={() => {
              setIsDragging(true);
              updatePixel(index); // update index to determine if the cell need to be colored
            }}
            onMouseEnter={() => {
              if (isDragging) {
                updatePixel(index); // update color, either by drawing or erasing
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
