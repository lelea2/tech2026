// interface ListNode {
//   val: number;
//   next: ListNode | null;
// }

/**
 * Reverse a singly linked list.
 */
// Time: O(n)
// Space: O(1)
export default function reverseList(
  head,
){
  let prev = null;
  let curr = head;

  while (curr !== null) {
    // Save next node before breaking the link
    const next = curr.next;

    // Reverse pointer
    curr.next = prev;

    // Move pointers forward
    prev = curr;
    curr = next;
  }

  // prev becomes the new head
  return prev;
}