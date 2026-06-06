// interface ListNode {
//   val: number;
//   next: ListNode | null;
// }

// Problem: Merge Two Sorted Linked Lists
// Given the heads of two sorted linked lists, merge them into one sorted list
// and return its head. The merged list must be made by splicing together the
// nodes of the two input lists (not creating new nodes).
//
// Approach: Iterative with a dummy head node
//   - Use a dummy sentinel node so we never need to special-case an empty result list
//   - Maintain a `tail` pointer to the last node we've appended
//   - At each step, compare the front nodes of the two lists and advance the
//     smaller one, attaching it to `tail`
//   - After one list is exhausted, append the remainder of the other directly
//
// Time:  O(n + m)  — each node is visited exactly once
// Space: O(1)      — pointers only, no extra allocation
//
// Edge cases to mention in interviews:
//   - One or both lists are empty → null input is safe; the while-loop is
//     skipped and `tail.next = a ?? b` handles the non-null side
//   - Lists of different lengths → the `??` fallback handles the tail attach
//   - Duplicate values → `a.val <= b.val` keeps the relative order stable

export default function linkedListCombineTwoSorted(listA, listB) {
  // Dummy node simplifies edge cases — result list always has a predecessor
  const dummy = {
    val: 0,
    next: null,
  };

  let tail = dummy;

  let a = listA;
  let b = listB;

  // Compare front nodes and greedily pick the smaller one each iteration
  while (a !== null && b !== null) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }

    tail = tail.next;
  }

  // At most one list still has remaining nodes; attach the whole tail in O(1)
  tail.next = a ?? b;

  return dummy.next;
}