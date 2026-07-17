const input = {
  operations: [
    { method: "performOperation", value: "type A" },
    { method: "performOperation", value: "type B" },
    { method: "undo" },
    { method: "redo" }
  ]
};

function processOperations(input) {
  const history = new SpreadsheetHistory();

  const results = input.operations.map(({ method, value }) => {
    if (method === "performOperation") {
      history.performOperation(value);
      return null;
    }

    if (method === "undo") {
      return history.undo();
    }

    if (method === "redo") {
      return history.redo();
    }

    throw new Error(`Unknown method: ${method}`);
  });

  return { operations: results };
}

console.log(processOperations(input));