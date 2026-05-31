# A Circular Linked List is a linked list where the last node points back to an earlier node (usually the head) instead of null.
# Detect the start of a cycle in a circular linked list.
class Node:
  def __init__(self, value):
    self.value = value
    self.next = None

def has_cycle(head):
  if not head or not head.next:
    return False

  slow = fast = head

  while fast and fast.next:
    slow = slow.next
    fast = fast.next.next

    if slow == fast:
      return True

  return False