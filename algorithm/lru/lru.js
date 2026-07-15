/**
 * LRU (Least Recently Used) Cache
 *
 * Problem:
 * Design a data structure that supports:
 *   - get(key): Get value in O(1) time
 *   - set(key, value): Put value in O(1) time
 *   - When capacity is exceeded, evict the least recently used item
 *
 * Approach:
 * Combine a doubly-linked list with a hash map:
 *   - Hash map: provides O(1) lookups by key
 *   - Doubly-linked list: maintains LRU order with O(1) node updates
 *   - Head = most recently used (newest access)
 *   - Tail = least recently used (oldest, evict first)
 *   - On get() or set(), move accessed node to head (mark as recent)
 *
 * Time Complexity:
 *   - get(key): O(1) — hash map lookup + node relinking
 *   - set(key, value): O(1) — hash map insert/update + node creation/relinking
 *   - Eviction: O(1) — remove tail node + delete from map
 *
 * Space Complexity:
 *   - O(capacity) — stores up to `capacity` key-value pairs in map + list nodes
 *
 * Interview Tips:
 *   - Explain why hash map alone isn't sufficient (can't evict in order)
 *   - Explain why linked list alone isn't sufficient (can't look up values)
 *   - Walk through get/set operations and how nodes move
 *   - Discuss edge cases: duplicate keys, single-capacity cache, empty cache
 *   - Mention real-world uses: CPU caches, browser caches, Redis
 */

/*
 * Illustration of the design:
 *
 *       entry             entry             entry             entry
 *       ______            ______            ______            ______
 *      | tail |.newer => |      |.newer => |      |.newer => | head |
 *      |  A   |          |  B   |          |  C   |          |  D   |
 *      |______| <= older.|______| <= older.|______| <= older.|______|
 *
 */

class Node {
  constructor(key = null, value = null) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError("capacity must be a positive integer");
    }

    this.capacity = capacity;
    this.cache = new Map();

    // Dummy nodes:
    // head.next is the most recently used real node.
    // tail.prev is the least recently used real node.
    this.head = new Node();
    this.tail = new Node();

    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Returns the value and marks the key as most recently used.
   *
   * Average time: O(1)
   */
  get(key) {
    const node = this.cache.get(key);

    if (!node) {
      return -1;
    }

    this.#moveToFront(node);
    return node.value;
  }

  /**
   * Inserts or updates a key.
   *
   * Average time: O(1)
   */
  set(key, value) {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      existingNode.value = value;
      this.#moveToFront(existingNode);
      return;
    }

    const node = new Node(key, value);

    this.cache.set(key, node);
    this.#addToFront(node);

    if (this.cache.size > this.capacity) {
      const leastRecentlyUsed = this.#removeLeastRecentlyUsed();
      this.cache.delete(leastRecentlyUsed.key);
    }
  }

  /**
   * Removes a node from its current position.
   */
  #remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  /**
   * Inserts a node immediately after the dummy head.
   */
  #addToFront(node) {
    node.prev = this.head;
    node.next = this.head.next;

    this.head.next.prev = node;
    this.head.next = node;
  }

  /**
   * Marks a node as most recently used.
   */
  #moveToFront(node) {
    this.#remove(node);
    this.#addToFront(node);
  }

  /**
   * Removes and returns the least recently used node.
   */
  #removeLeastRecentlyUsed() {
    const node = this.tail.prev;
    this.#remove(node);
    return node;
  }
}