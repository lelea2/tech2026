class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(node) {
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;

    const min = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._bubbleDown(0);
    }

    return min;
  }

  get size() {
    return this.heap.length;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.heap[parent].f <= this.heap[index].f) break;

      [this.heap[parent], this.heap[index]] = [
        this.heap[index],
        this.heap[parent],
      ];

      index = parent;
    }
  }

  _bubbleDown(index) {
    const n = this.heap.length;

    while (true) {
      let smallest = index;
      const left = index * 2 + 1;
      const right = index * 2 + 2;

      if (
        left < n &&
        this.heap[left].f < this.heap[smallest].f
      ) {
        smallest = left;
      }

      if (
        right < n &&
        this.heap[right].f < this.heap[smallest].f
      ) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];

      index = smallest;
    }
  }
}

function shortestPathAStar(grid) {
  if (!grid || grid.length === 0 || grid[0].length === 0) {
    return -1;
  }

  const m = grid.length;
  const n = grid[0].length;

  // Start or destination blocked
  if (grid[0][0] === 1 || grid[m - 1][n - 1] === 1) {
    return -1;
  }

  // Manhattan distance
  const heuristic = (r, c) =>
    Math.abs(m - 1 - r) + Math.abs(n - 1 - c);

  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  // gScore[r][c] = shortest known number of MOVES to reach cell
  const gScore = Array.from({ length: m }, () =>
    Array(n).fill(Infinity)
  );

  gScore[0][0] = 0;

  const heap = new MinHeap();

  heap.push({
    row: 0,
    col: 0,
    g: 0,
    f: heuristic(0, 0),
  });

  while (heap.size > 0) {
    const current = heap.pop();
    const { row, col, g } = current;

    // Skip stale heap entries
    if (g !== gScore[row][col]) {
      continue;
    }

    // Reached destination
    if (row === m - 1 && col === n - 1) {
      // g is number of edges/moves.
      // Problem asks for number of cells visited.
      return g + 1;
    }

    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;

      if (
        nr < 0 ||
        nr >= m ||
        nc < 0 ||
        nc >= n ||
        grid[nr][nc] === 1
      ) {
        continue;
      }

      const newG = g + 1;

      if (newG < gScore[nr][nc]) {
        gScore[nr][nc] = newG;

        heap.push({
          row: nr,
          col: nc,
          g: newG,
          f: newG + heuristic(nr, nc),
        });
      }
    }
  }

  return -1;
}