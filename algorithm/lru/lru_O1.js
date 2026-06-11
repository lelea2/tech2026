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
  constructor(key, value) {
    this.key = key;
    this.val = value;
    this.newer = null;
    this.older = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.length = 0;
    this.map = {};
    // save the head and tail so we can update it easily
    this.head = null;
    this.tail = null;
  }

  /**
   * Get value by key
   * Time: O(1) — hash map lookup + node relinking
   * If key exists, mark it as recently used by moving to head
   * If not found, return -1
   */
  get(key) {
    if (this.map.hasOwnProperty(key)) {
      this.updateKey(key);
      return this.map[key].val;
    } else {
      return -1;
    }
  }

  /**
   * Move accessed node to head (mark as most recently used)
   * Time: O(1) — node relinking operations
   * 
   * Algorithm:
   * 1. Remove node from its current position in the doubly-linked list
   * 2. Insert node at head (most recent position)
   * 3. Handle edge cases: node at tail, node at head, or only node
   */
  updateKey(key) {
    const node = this.map[key];
    
    // Step 1: Break the chain — remove node from current position
    // If node has a newer neighbor, connect it to node's older neighbor
    if (node.newer) {
      node.newer.older = node.older;
    } else {
      // Node is at head, update head pointer
      this.head = node.older;
    }

    // If node has an older neighbor, connect it to node's newer neighbor
    if (node.older) {
      node.older.newer = node.newer;
    } else {
      // Node is at tail, update tail pointer
      this.tail = node.newer;
    }

    // Step 2: Insert node at head (most recently used)
    node.older = this.head;
    node.newer = null;
    if (this.head) {
      this.head.newer = node;
    }
    this.head = node;
    
    // Step 3: Handle edge case — if cache becomes empty (shouldn't happen in updateKey)
    if (!this.tail) {
      this.tail = node;
    }
  }

  /**
   * Set or update key-value pair
   * Time: O(1) — hash map operations + list node relinking
   * Space: O(1) per insertion
   * 
   * Algorithm:
   * 1. If key exists, update value and mark as recently used
   * 2. If cache at capacity, evict least recently used (tail) item
   * 3. Insert new node at head (most recent position)
   */
  set(key, value) {
    const node = new Node(key, value);
    
    // Case 1: Key already exists — update value and mark as recently used
    if (this.map.hasOwnProperty(key)) {
      this.map[key].val = value;
      this.updateKey(key);
      return;
    }
    
    // Case 2: Cache at capacity — evict least recently used (tail) item
    if (this.length >= this.capacity) {
      // Remove tail node (least recently used)
      const dKey = this.tail.key;
      this.tail = this.tail.newer;
      if (this.tail) {
        this.tail.older = null;  // Disconnect from old tail
      }
      delete this.map[dKey];  // Remove from hash map
      this.length--;
    }

    // Case 3: Insert new node at head (most recently used position)
    node.older = this.head;
    if (this.head) {
      this.head.newer = node;
    }
    this.head = node;
    
    // Handle edge case — first insertion in empty cache
    if (!this.tail) {
      this.tail = node;
    }
    
    // Add to hash map and increment length
    this.map[key] = node;
    this.length++;
  }
}

export default LRUCache;
