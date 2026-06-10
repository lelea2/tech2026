import { useRef, useState } from 'react';
import styles from './styles.module.css';

const GRID_SIZE = 10;

export default function App() {
  const gridRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [selectedCells, setSelectedCells] = useState(new Set());

  const getPoint = (event) => {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const getSelectionBox = (start, end) => {
    return {
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      right: Math.max(start.x, end.x),
      bottom: Math.max(start.y, end.y),
    };
  };

  const getSelectedCells = (box) => {
    const nextSelected = new Set();

    if (!gridRef.current) return nextSelected;

    const cells = gridRef.current.querySelectorAll('[data-cell-index]');

    cells.forEach((cell) => {
      const rect = cell.getBoundingClientRect();
      const index = Number(cell.dataset.cellIndex);

      const overlaps =
        rect.left < box.right &&
        rect.right > box.left &&
        rect.top < box.bottom &&
        rect.bottom > box.top;

      if (overlaps) {
        nextSelected.add(index);
      }
    });

    return nextSelected;
  };

  const handleMouseDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    const point = getPoint(event);

    setIsDragging(true);
    setStartPoint(point);
    setCurrentPoint(point);
    setSelectedCells(new Set());
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !startPoint) {
      return;
    }

    const point = getPoint(event);
    const box = getSelectionBox(startPoint, point);

    setCurrentPoint(point);
    setSelectedCells(getSelectedCells(box));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setStartPoint(null);
    setCurrentPoint(null);
  };

  const handlePageClick = () => {
    if (!isDragging) {
      setSelectedCells(new Set());
    }
  };

  const getSelectionInfo = (cells) => {
    if (cells.size === 0) return null;

    const indices = Array.from(cells);
    const rowIndices = indices.map((i) => Math.floor(i / GRID_SIZE));
    const colIndices = indices.map((i) => i % GRID_SIZE);

    const minRow = Math.min(...rowIndices);
    const maxRow = Math.max(...rowIndices);
    const minCol = Math.min(...colIndices);
    const maxCol = Math.max(...colIndices);

    return {
      count: cells.size,
      rows: maxRow - minRow + 1,
      cols: maxCol - minCol + 1,
      rowStart: minRow + 1,
      colStart: minCol + 1,
    };
  };

  const selectionBox =
    isDragging && startPoint && currentPoint
      ? getSelectionBox(startPoint, currentPoint)
      : null;

  const selectionInfo = getSelectionInfo(selectedCells);

  return (
    <div
      className="page"
      onClick={handlePageClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        ref={gridRef}
        className="grid"
        onMouseDown={handleMouseDown}
        onClick={(event) => event.stopPropagation()}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => (
          <div
            key={index}
            data-cell-index={index}
            className={`cell ${
              selectedCells.has(index) ? 'selected' : ''
            }`}
          />
        ))}
      </div>

      {selectionInfo && (
        <div className="dashboard">
          <p className="dashboardTitle">Selection</p>
          <dl className="statList">
            <div className="stat">
              <dt>Cells</dt>
              <dd>{selectionInfo.count}</dd>
            </div>
            <div className="stat">
              <dt>Dimensions</dt>
              <dd>{selectionInfo.cols} × {selectionInfo.rows}</dd>
            </div>
            <div className="stat">
              <dt>Start</dt>
              <dd>Row {selectionInfo.rowStart}, Col {selectionInfo.colStart}</dd>
            </div>
          </dl>
        </div>
      )}

      {selectionBox && (
        <div
          className="selectionBox"
          style={{
            left: selectionBox.left,
            top: selectionBox.top,
            width: selectionBox.right - selectionBox.left,
            height: selectionBox.bottom - selectionBox.top,
          }}
        />
      )}
    </div>
  );
}
