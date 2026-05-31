class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

/**
 * Detects if a linked list has a cycle. 
 * Detecting a cycle in a linked list involves using two pointers,
 * one moving at a slower pace than the other. 
 * If there is a cycle, the faster pointer will eventually catch up 
 * to the slower pointer.
 * @param {*} head 
 * @returns 
 */
export default function hasCycle(head) {
  if (!head || !head.next) {
    return false;
  }

  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      return true;
    }
  }

  return false;
}