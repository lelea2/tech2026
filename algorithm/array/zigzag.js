function generateGrid(rows, cols) {
  const grid = Array.from({ length: rows }, () =>
    Array(cols).fill(0)
  );

  let num = 1;

  for (let col = 0; col < cols; col++) {
    if (col % 2 === 0) { // left to right, evem column
      // top -> bottom
      for (let row = 0; row < rows; row++) {
        grid[row][col] = num++; 
      }
    } else {
      // bottom -> top
      for (let row = rows - 1; row >= 0; row--) {
        grid[row][col] = num++;
      }
    }
  }

  return grid;
}

console.log(generateGrid(3, 4));

/**
 * 
1   6   7   12
2   5   8   11
3   4   9   10
 */