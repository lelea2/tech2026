// Given a binary search tree (BST), find the lowest common ancestor (LCA) of two given nodes in the BST.
// According to the definition of LCA on Wikipedia: 
// “The lowest common ancestor is defined between two nodes v and w as the lowest node in 
// T that has both v and w as descendants (where we allow a node to be a descendant of itself).”
//       _6_
//     /    \
//    2      8
//   / \    / \
//  0   4  7   9
//     / \
//    3   5

// For example, the lowest common ancestor (LCA) of nodes 2 and 8 is 6. 
// Another example is LCA of nodes 2 and 4 is 2, 
// since a node can be a descendant of itself according to the LCA definition.

/**
 *  * Binary Search Tree Lowest Common Ancestor
 * In a BST:
 * - left subtree values are smaller than root.val
 * - right subtree values are larger than root.val
 * If both nodes are smaller than root, LCA is in the left subtree.
 * If both nodes are larger than root, LCA is in the right subtree.
 * Otherwise, root is the split point, so root is the LCA.
 */
/**
 * Definition for a binary tree node.
 * 
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}
 * }
 */
/**
 * @param {TreeNode} root
 * @param {TreeNode} a
 * @param {TreeNode} b
 * @return {TreeNode}
 */
/*
Time:  O(h)
Space: O(1)

h = height of the tree
Balanced BST: O(log n)
Skewed BST:   O(n)
*/
export default function lowestCommonAncestor(root, a, b) {
  while(root !== null) {
    const value = root.val;
    if (a.val < value && b.val < value) {
      root = root.left
    } else if(a.val > value && b.val > value){
      root =  root.right;
    } else {
      return root
    }
  }
};