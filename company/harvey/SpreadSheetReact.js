import React, { useState } from "react";

const COLUMNS = ["A", "B", "C"];
const ROWS = [1, 2, 3];

export default function Spreadsheet() {
  const [cells, setCells] = useState({});
  const [editingCell, setEditingCell] = useState(null);

  function setCell(cellId, value) {
    if (value === "" || value.startsWith("=") || !Number.isNaN(Number(value))) {
      setCells((previous) => ({
        ...previous,
        [cellId]: value,
      }));
    }
  }

  function getCellValue(cellId, visited = new Set()) {
    if (visited.has(cellId)) {
      return "#CYCLE!";
    }

    const rawValue = cells[cellId] ?? "";

    if (rawValue === "") {
      return 0;
    }

    if (!rawValue.startsWith("=")) {
      return Number(rawValue);
    }

    const nextVisited = new Set(visited);
    nextVisited.add(cellId);

    return evaluateFormula(rawValue, nextVisited);
  }

  function evaluateFormula(formula, visited) {
    const match = formula.match(/^=SUM\(([^)]+)\)$/i);

    if (!match) {
      return "#ERROR!";
    }

    const references = match[1]
      .split(",")
      .map((reference) => reference.trim().toUpperCase());

    let total = 0;

    for (const reference of references) {
      if (!/^[A-Z]+\d+$/.test(reference)) {
        return "#ERROR!";
      }

      const value = getCellValue(reference, visited);

      if (value === "#ERROR!" || value === "#CYCLE!") {
        return value;
      }

      total += value;
    }

    return total;
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h2>React Spreadsheet</h2>

      <p>
        Enter a number or a formula such as <code>=SUM(A1, B1)</code>.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40px repeat(3, 100px)",
          width: "fit-content",
          borderTop: "1px solid #ccc",
          borderLeft: "1px solid #ccc",
        }}
      >
        <HeaderCell />

        {COLUMNS.map((column) => (
          <HeaderCell key={column}>{column}</HeaderCell>
        ))}

        {ROWS.map((row) => (
          <React.Fragment key={row}>
            <HeaderCell>{row}</HeaderCell>

            {COLUMNS.map((column) => {
              const cellId = `${column}${row}`;
              const rawValue = cells[cellId] ?? "";

              const displayedValue =
                editingCell === cellId
                  ? rawValue
                  : rawValue.startsWith("=")
                    ? getCellValue(cellId)
                    : rawValue;

              return (
                <div
                  key={cellId}
                  style={{
                    width: 100,
                    height: 40,
                    borderRight: "1px solid #ccc",
                    borderBottom: "1px solid #ccc",
                    boxSizing: "border-box",
                  }}
                >
                  <input
                    aria-label={`Cell ${cellId}`}
                    value={displayedValue}
                    onFocus={() => setEditingCell(cellId)}
                    onBlur={() => setEditingCell(null)}
                    onChange={(event) =>
                      setCell(cellId, event.target.value)
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      outline: "none",
                      padding: "0 8px",
                      boxSizing: "border-box",
                      fontSize: 14,
                    }}
                  />
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function HeaderCell({ children }) {
  return (
    <div
      style={{
        width: "100%",
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRight: "1px solid #ccc",
        borderBottom: "1px solid #ccc",
        background: "#f3f3f3",
        fontWeight: "bold",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}