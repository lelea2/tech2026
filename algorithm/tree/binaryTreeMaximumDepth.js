// interface TreeNode {
//   val: number;
//   left: TreeNode | null;
//   right: TreeNode | null;
// }

/**
 * /**

 * Interview idea:
 * The depth of a tree is:
 * - 0 if the node is null
 * - otherwise, 1 + max(depth of left subtree, depth of right subtree)
 * Time: O(n)
 * Space: O(n) in the worst case for the call stack.
 */
/**
 * @param {TreeNode | null} root
 * @return {number}
 */
export default function binaryTreeMaximumDepth(root) {
  if (root === null) {
    return 0;
  }

  const leftDepth = binaryTreeMaximumDepth(root.left);
  const rightDepth = binaryTreeMaximumDepth(root.right);
  return 1 + Math.max(leftDepth, rightDepth);
}

// Examples
// Input: root = [1,2,3,4,5,6,7]
// Output: 3
// Explanation: The tree has a maximum depth of 3. The longest path from root (1) to leaves (4, 5, 6, 

// Input: root = [1,null,2]
// Output: 2
// Explanation: The tree has a maximum depth of 2. The longest path from root (1) to leaf (2) is of length 2.