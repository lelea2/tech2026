/**
 * Interview Question:
 * Given the root of a binary tree, return its level-order traversal.
 *
 * Requirements:
 * - Visit nodes from top to bottom
 * - Visit nodes left to right within each level
 * - Return a nested array where each inner array contains one level's values
 * - Return an empty array when the tree is empty
 *
 * Approach:
 * Use (BFS) breadth-first search with a queue. For each loop iteration, capture the
 * current queue length. That length represents exactly how many nodes belong to
 * the current level. Process those nodes, append their children for the next
 * level, then push the current level values into the result.
 *
 * Complexity:
 * O(n) time because every node is visited once.
 * O(n) space because the queue can hold up to one level of nodes.
 */

/**
 * Definition for a binary tree node:
 * function TreeNode(val) {
 *   this.val = val;
 *   this.left = null;
 *   this.right = null;
 * }
 *
 * @param {TreeNode | null} root
 * @return {number[][]}
 */

export default function binaryTreeLevelOrderTraversal(root) {
  if (root === null) {
    return [];
  }

  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);

      if (node.left !== null) {
        queue.push(node.left);
      }

      if (node.right !== null) {
        queue.push(node.right);
      }
    }

    result.push(level);
  }

  return result;
}
