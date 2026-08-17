/**
 * Interview Question:
 * Given an image represented as an m x n grid of integers, a starting pixel
 * (startRow, startCol), perform a flood fill: starting from the given pixel,
 * replace the color of every 4-directionally connected pixel that shares the
 * starting pixel's original color.
 *
 * In this version:
 * - 0 = fillable background pixel
 * - 1 = outline/border pixel (never touched)
 * - 2 = filled pixel (the fill color)
 *
 * Example:
 *   Input grid:
 *   [
 *     [1, 1, 1, 1],
 *     [1, 0, 0, 1],
 *     [1, 0, 0, 1],
 *     [1, 1, 1, 1],
 *   ]
 *   startRow = 1, startCol = 1
 *
 *   Output grid:
 *   [
 *     [1, 1, 1, 1],
 *     [1, 2, 2, 1],
 *     [1, 2, 2, 1],
 *     [1, 1, 1, 1],
 *   ]
 *
 * Answer:
 * BFS from the starting cell. Mark the start cell filled, then repeatedly
 * pop from a queue and enqueue any unvisited (value 0) 4-directional
 * neighbor, marking it filled as it's enqueued so it's never pushed twice.
 *
 * Complexity:
 * O(m * n) time and space in the worst case, since every cell can be
 * visited once and the queue can hold up to O(m * n) cells.
 *
 * @param {number[][]} grid
 * @param {number} startRow
 * @param {number} startCol
 * @returns {number[][]}
 */
function floodFill(grid, startRow, startCol) {
  const m = grid.length;
  const n = grid[0].length;

  // If user clicks directly on an outline, do nothing.
  if (grid[startRow][startCol] === 1) return grid;

  const queue = [[startRow, startCol]];
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  grid[startRow][startCol] = 2;

  while (queue.length > 0) {
    const [r, c] = queue.shift();

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr >= 0 &&
        nr < m &&
        nc >= 0 &&
        nc < n &&
        grid[nr][nc] === 0
      ) {
        grid[nr][nc] = 2;
        queue.push([nr, nc]);
      }
    }
  }

  return grid;
}

// Example usage:
// floodFill(
//   [
//     [1, 1, 1, 1],
//     [1, 0, 0, 1],
//     [1, 0, 0, 1],
//     [1, 1, 1, 1],
//   ],
//   1,
//   1
// );
// => [
//   [1, 1, 1, 1],
//   [1, 2, 2, 1],
//   [1, 2, 2, 1],
//   [1, 1, 1, 1],
// ]
