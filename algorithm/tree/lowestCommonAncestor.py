# =========================================================
# Lowest Common Ancestor in a Binary Search Tree
# =========================================================
#
# Data Structure:
# - Binary Search Tree (BST)
#
# BST Property:
# - left subtree values < root.val
# - right subtree values > root.val
#
# =========================================================
# Core Idea
# =========================================================
#
# The LCA is the first node where:
# - one node is on the left
# - the other node is on the right
#
# OR:
# - current node equals p or q
#
# Since BST is ordered:
#
# 1. If both p and q are smaller than root:
#    move left
#
# 2. If both p and q are greater than root:
#    move right
#
# 3. Otherwise:
#    current node is the split point => LCA
#
# =========================================================
# Time Complexity
# =========================================================
# O(h)
#
# h = height of tree
#
# =========================================================
# Space Complexity
# =========================================================
# O(1)
#
# Iterative solution.
# =========================================================

class Solution:
  def lowestCommonAncestor(self, root, p, q):
    while root:
      # Both nodes are in left subtree.
      if p.val < root.val and q.val < root.val:
        root = root.left

      # Both nodes are in right subtree.
      elif p.val > root.val and q.val > root.val:
        root = root.right
      # Split point found.
      else:
        return root