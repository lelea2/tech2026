/**
 * Count the number of islands (4-directionally connected 1s) in a binary grid.
 *
 * What this solves:
 * - Given a map of land (1) and water (0), return how many separate land masses exist.
 *
 * Plan:
 * 1. Scan every cell in the grid.
 * 2. When we find unvisited land, we discovered a new island, so increment the count.
 * 3. Run DFS from that cell to mark the entire connected component as visited.
 * 4. Continue scanning; each DFS corresponds to exactly one distinct island.
 *
 * Why this works:
 * - DFS visits all cells connected to a starting land cell (up/down/left/right),
 *   so one DFS marks one whole island.
 * - We never count visited land again, preventing double counting.
 *
 * Complexity:
 * - Time: O(rows * cols), each cell is visited at most once.
 * - Space: O(rows * cols) for the visited matrix (plus recursion stack in worst case).
 *
 * @param {number[][]} grid
 * @returns {number}
 */
export default function countIslandOnGrid(grid) {
	const rows = grid.length;
	if (rows === 0) {
		return 0;
	}

	const cols = grid[0].length;
	const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
	let islands = 0;

	function dfs(r, c) {
		if (r < 0 || r >= rows || c < 0 || c >= cols) {
			return;
		}

		if (visited[r][c] || grid[r][c] !== 1) {
			return;
		}

		visited[r][c] = true;
		dfs(r + 1, c);
		dfs(r - 1, c);
		dfs(r, c + 1);
		dfs(r, c - 1);
	}

	for (let r = 0; r < rows; r += 1) {
		for (let c = 0; c < cols; c += 1) {
			if (grid[r][c] === 1 && !visited[r][c]) {
				islands += 1;
				dfs(r, c);
			}
		}
	}

	return islands;
}

// Example usage:
// countIslandOnGrid([[1, 0], [0, 0], [0, 1], [0, 1], [1, 1]]); // => 2
// countIslandOnGrid([[1, 0, 0], [1, 1, 1], [0, 0, 1]]); // => 1
// countIslandOnGrid([[1, 1, 1], [0, 0, 0], [0, 0, 0]]); // => 1
