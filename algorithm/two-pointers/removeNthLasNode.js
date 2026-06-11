// Definition for a Linked List node
// class ListNode {
//     constructor(val = 0, next = null) {
//         this.val = val;
//         this.next = next;
//     }
// }

import { ListNode } from './ds_v1/LinkedList.js';

export default function removeNthLastNode(head, n) {
  const dummy = {
    val: 0,
    next: head,
  };

  let fast = dummy;
  let slow = dummy;

  // Move fast n + 1 steps ahead
  for (let i = 0; i <= n; i++) {
    fast = fast.next;
  }

  // Move both pointers
  while (fast !== null) {
    fast = fast.next;
    slow = slow.next;
  }

  // Remove the target node
  slow.next = slow.next.next;

  return dummy.next;
}
