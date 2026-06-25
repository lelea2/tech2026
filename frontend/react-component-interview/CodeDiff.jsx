import React, { useMemo } from "react";

function buildDiff(oldCode, newCode) {
  const oldLines = oldCode.split("\n"); // array of old code
  const newLines = newCode.split("\n"); // array of new code

  const max = Math.max(oldLines.length, newLines.length);
  const result = [];

  for (let i = 0; i < max; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      result.push({
        type: "same",
        oldLineNumber: i + 1,
        newLineNumber: i + 1,
        content: oldLine,
      });
    } else {
      if (oldLine !== undefined) {
        result.push({
          type: "removed",
          oldLineNumber: i + 1,
          newLineNumber: null,
          content: oldLine,
        });
      }

      if (newLine !== undefined) {
        result.push({
          type: "added",
          oldLineNumber: null,
          newLineNumber: i + 1,
          content: newLine,
        });
      }
    }
  }

  return result;
}

function DiffViewer({ oldCode, newCode }) {
  const diff = useMemo(() => buildDiff(oldCode, newCode), [oldCode, newCode]);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        overflow: "hidden",
        fontFamily: "monospace",
        fontSize: 14,
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          background: "#f6f8fa",
          borderBottom: "1px solid #ddd",
          fontFamily: "sans-serif",
          fontWeight: "bold",
        }}
      >
        Code Diff
      </div>

      {diff.map((line, index) => {
        const background =
          line.type === "added"
            ? "#e6ffed"
            : line.type === "removed"
            ? "#ffeef0"
            : "white";

        const prefix =
          line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";

        return (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "50px 50px 24px 1fr",
              background,
              minHeight: 24,
              lineHeight: "24px",
            }}
          >
            {/* Render line numbers */}
            <div
              style={{
                textAlign: "right",
                paddingRight: 8,
                color: "#666",
                background: "#f6f8fa",
                borderRight: "1px solid #ddd",
                userSelect: "none",
              }}
            >
              {line.oldLineNumber ?? ""}
            </div>
            {/* Render line numbers */}
            <div
              style={{
                textAlign: "right",
                paddingRight: 8,
                color: "#666",
                background: "#f6f8fa",
                borderRight: "1px solid #ddd",
                userSelect: "none",
              }}
            >
              {line.newLineNumber ?? ""}
            </div>

            {/* Render prefix +/-/null */}
            <div
              style={{
                textAlign: "center",
                color: "#666",
                userSelect: "none",
              }}
            >
              {prefix}
            </div>
            {/* Render actual code */}
            <pre
              style={{
                margin: 0,
                padding: "0 8px",
                whiteSpace: "pre-wrap",
              }}
            >
              {line.content || " "}
            </pre>
          </div>
        );
      })}
    </div>
  );
}

// Testing code diff
function App() {
  const oldCode = `function add(a, b) {
    return a + b;
  }`;

  const newCode = `function add(a, b) {
    return Number(a) + Number(b);
  }`;

  return (
    <div className="app">
      <DiffViewer oldCode={oldCode} newCode={newCode} />;
    </div>
  )
}

export default App;