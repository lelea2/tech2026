// Building Trie: O(W * L)
// DFS search: roughly O(m * n * 4^L)
// W = number of words
// L = max word length
// m = rows
// n = columns
class TrieNode {
  constructor() {
    this.children = new Map();
    this.word = null;
  }
}

function findWords(grid, words) {
  const root = new TrieNode();

  // Build Trie
  for (const word of words) {
    let node = root;

    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }

    node.word = word;
  }

  const result = [];
  const rows = grid.length;
  const cols = grid[0].length;

  function dfs(row, col, node) {
    if (
      row < 0 ||
      row >= rows ||
      col < 0 ||
      col >= cols
    ) {
      return;
    }

    const char = grid[row][col];

    if (char === "#" || !node.children.has(char)) {
      return;
    }

    const nextNode = node.children.get(char);

    if (nextNode.word !== null) {
      result.push(nextNode.word);
      nextNode.word = null; // avoid duplicate result
    }

    grid[row][col] = "#";

    dfs(row + 1, col, nextNode);
    dfs(row - 1, col, nextNode);
    dfs(row, col + 1, nextNode);
    dfs(row, col - 1, nextNode);

    grid[row][col] = char;
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      dfs(row, col, root);
    }
  }

  return result;
}