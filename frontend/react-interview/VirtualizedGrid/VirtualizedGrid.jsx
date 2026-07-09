import {useMemo, useState} from 'react';
import './VirtualizedGrid.css';

const TOTAL = 5000;
const ROW_HEIGHT = 40;
const VIEWPORT_HEIGHT = 280;
const BUFFER = 6;

export default function VirtualizedGrid() {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + BUFFER * 2;
  const endIndex = Math.min(TOTAL, startIndex + visibleCount);

  const visibleRows = useMemo(
    () => Array.from({length: endIndex - startIndex}, (_, i) => startIndex + i),
    [endIndex, startIndex],
  );

  return (
    <div className="virtual-grid-wrap">
      <h3>Virtualized List/Grid</h3>
      <div
        className="virtual-grid"
        style={{height: VIEWPORT_HEIGHT}}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{height: TOTAL * ROW_HEIGHT, position: 'relative'}}>
          {visibleRows.map((index) => (
            <div
              key={index}
              className="row"
              style={{transform: `translateY(${index * ROW_HEIGHT}px)`}}
            >
              Result #{index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
