/**
 * @param {TreeNode | null} root
 * @param {TreeNode | null} subRoot
 * @return {boolean}
 */
function isSameTree(
  a, b
) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  if (a.val !== b.val) return false;

  return (
    isSameTree(a.left, b.left) &&
    isSameTree(a.right, b.right)
  );
}


// Time: O(m * n) where m is the number of nodes in the main tree and n is the number of nodes in the subtree.
// Space: O(h) where h is the height of the main tree (for the call stack).
export default function binaryTreeSubtree(root, subRoot) {
  if (subRoot === null) return true;
  if (root === null) return false;

  // Otherwise search left and right subtrees
  if (isSameTree(root, subRoot)) {
    return true;
  }

  return (
    binaryTreeSubtree(root.left, subRoot) ||
    binaryTreeSubtree(root.right, subRoot)
  );
}