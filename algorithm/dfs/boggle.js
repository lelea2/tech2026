/**
 * Interview Question:
 * Given a 2D board of characters and a word, determine whether the word exists
 * in the board.
 *
 * Input:
 * dictionary = ["GEEKS", "FOR", "QUIZ", "GO"]
 * board = [
 *   ["G", "I", "Z"],
 *   ["U", "E", "K"],
 *   ["Q", "S", "E"]
 * ]
 *
 * Output:
 * Words present in the board: "GEEKS", "QUIZ"
 *
 * Rules:
 * - A word is built by moving from one cell to an adjacent cell
 * - This implementation checks four directions: up, down, left, right
 * - A cell cannot be reused in the same word path
 *
 * Answer:
 * Treat the board as a graph where each cell is a node. Start DFS from every
 * cell. During DFS, compare the current board character with the current word
 * character. Mark the cell as visited while it is part of the current path, then
 * unmark it during backtracking so it can be reused by other paths.
 *
 * Follow-up:
 * If the interviewer asks to find all dictionary words efficiently, build a Trie
 * from the dictionary and DFS the board once while pruning paths that are not
 * prefixes in the Trie.
 *
 * Complexity for one word:
 * O(rows * cols * 4^wordLength) time in the worst case.
 * O(rows * cols) space for visited plus recursion stack.
 */

/**
 *
 * @param {String} word -> a word that is in dictionary
 * @param {Number} index
 * @param {*} board array[][] // character array
 * @param {Number} i
 * @param {Number} j
 * @param {*} visited array[][] // boolean array
 */
function search(word, index, board, i, j, visited) {
  if (i < 0 || j < 0 || i === board.length || j === board[0].length || visited[i][j] === true) {
    return;
  }
  // Mark visited node
  visited[i][j] = true;
  let result = false;
  if (board[i][j] === word.indexOf(index)) {
    if (index === word.length - 1) { // last character is matching, return true
      return true;
    }
    result = search(word, index + 1, board, i - 1, j, visited) ||
      search(word, index + 1, board, i + 1, j, visited) ||
      search(word, index + 1, board, i, j - 1, visited) ||
      search(word, index + 1, board, i, j + 1, visited);
  }
  visited[i][j] = false; // remark node as not visited for next root search
  return result;
}

/**
 * Function helper to return if board has path to exisiting word
 * @param {*} board
 * @param {*} word
 */
function exist(board, word) {
  if (board.length === 0) {
    return false;
  }
  const visited = new Array(board.length); // [board.length][board[0].length] array
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (search(word, 0, board, i, j, visited)) {
        return true;
      }
    }
  }
  return false;
}
