// Problem: Determine whether `subRoot` is an exact subtree of `root`.
// A subtree must match node values and the complete left/right structure.
// Example: root = [3,4,5,1,2], subRoot = [4,1,2]
// Output: true
function isSubtree(root, subRoot) {
  if (!subRoot) return true;
  if (!root) return false;

  if (isSameTree(root, subRoot)) {
    return true;
  }

  return (
    isSubtree(root.left, subRoot) ||
    isSubtree(root.right, subRoot)
  );
}

function isSameTree(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;

  if (a.val !== b.val) {
    return false;
  }

  return (
    isSameTree(a.left, b.left) &&
    isSameTree(a.right, b.right)
  );
}