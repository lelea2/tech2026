import { useState, useCallback } from "react";

export default function App() {
  const [row, setRow] = useState(0);
  const [column, setColumn] = useState(0);
  const [arr, setArr] = useState([]);

  const handleRow = (e) => {
    setRow(Number(e.target.value));
  };

  const handleColumn = (e) => {
    setColumn(Number(e.target.value));
  };

  const handleSubmit = useCallback(() => {
    if (row <= 0 || column <= 0) return;

    let num = 1;

    const grid = Array.from({ length: row }, () =>
      Array(column).fill(0)
    );

    for (let col = 0; col < column; col++) {
      if (col % 2 === 0) {
        for (let r = 0; r < row; r++) {
          grid[r][col] = num++;
        }
      } else {
        for (let r = row - 1; r >= 0; r--) {
          grid[r][col] = num++;
        }
      }
    }

    setArr(grid);
  }, [column, row]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="row" className="text-xs text-slate-400 uppercase tracking-wide">Row</label>
          <input
            id="row"
            onChange={handleRow}
            type="number"
            min={1}
            className="w-24 px-3 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded focus:outline-none focus:border-orange-500 text-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="column" className="text-xs text-slate-400 uppercase tracking-wide">Column</label>
          <input
            id="column"
            onChange={handleColumn}
            type="number"
            min={1}
            className="w-24 px-3 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded focus:outline-none focus:border-orange-500 text-white"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="px-4 py-1.5 text-sm border border-slate-500 rounded hover:border-slate-300 hover:text-white transition-colors"
      >
        Generate
      </button>

      {arr.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="border-collapse text-sm">
            <tbody>
              {arr.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-4 text-center border border-slate-600 text-slate-200 bg-slate-800/50"
                    >
                      {col}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
