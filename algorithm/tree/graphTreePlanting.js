// Requirement: Plant trees only in empty cells. No two trees may be adjacent
// vertically or horizontally. Return the number of trees planted.
//
// Test case:
// Input: grid = [[0,0,0], [0,0,0], [0,0,0]]
// Output: 5
// One valid result is:
// [[1,0,1], [0,1,0], [1,0,1]]
function plantTrees(grid) {
  const rows = grid.length;
  const cols = grid[0].length;

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  const canPlant = (r, c) => {
    if (grid[r][c] === 1) return false;

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        grid[nr][nc] === 1
      ) {
        return false;
      }
    }

    return true;
  };

  let count = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (canPlant(r, c)) {
        grid[r][c] = 1; // mark immediately
        count++;
      }
    }
  }

  return count;
}