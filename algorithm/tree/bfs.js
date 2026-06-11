/**
 * Interview Question:
 * Given a graph represented as an adjacency list and a source node, implement
 * breadth-first search.
 *
 * Requirements:
 * - Visit nodes level by level starting from the source
 * - Return the traversal order as an array
 * - Use a queue to process nodes in first-in, first-out order
 * - Track visited nodes so cycles do not cause infinite loops
 * - Return an empty array when the graph is empty
 *
 * Follow-up:
 * Discuss time and space complexity in terms of V vertices and E edges.
 */

/**
 * @param {Record<string, Array<string>} graph The adjacency list representing the graph.
 * @param {string} source The source node to start traversal from. Has to be a valid node if graph is non-empty.
 * @return {Array<string>} A BFS-traversed order of nodes.
 */
export default function breadthFirstSearch(graph, source) {
  if (Object.keys(graph).length === 0) {
    return [];
  }
  const result = [];
  const visited = new Set();
  const queue = new Queue();

  // Start from source node
  queue.enqueue(source);
  visited.add(source);

  while(!queue.isEmpty()) {
    const currentNode = queue.dequeue();
    result.push(currentNode);
    // get neighbor of currentNode
    const neighbors = graph[currentNode] || [];
    for (const neighbor of neighbors) {
      // only visit each node once
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.enqueue(neighbor);
      }
    }
  }
  return result;
}

// const graph1 = {
//   A: ['B', 'C', 'D'],
//   B: ['E', 'F'],
//   C: ['G', 'H'],
//   D: ['I', 'J'],
//   E: ['D'],
//   F: [],
//   G: [],
//   H: [],
//   I: [],
//   J: [],
// };

// breadthFirstSearch(graph1, 'A'); // ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']


/*  Auxiliary classes */

/**
 * A Queue class with O(1) enqueue and dequeue is provided for you.
 * You can use it directly should you wish to.
 *
 * Example usage:
 * const q = new Queue();
 * q.enqueue('a');
 * q.enqueue('b');
 * q.dequeue(); //'a'
 * q.isEmpty(); // False
 */
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class Queue {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  isEmpty() {
    return this.length === 0;
  }

  enqueue(item) {
    const newNode = new Node(item);
    if (this.isEmpty()) {
      this.head = newNode;
    } else if (this.tail) {
      this.tail.next = newNode;
    }
    this.tail = newNode;
    this.length++;
  }

  dequeue() {
    if (this.isEmpty() || !this.head) {
      return null;
    } else {
      const removedNode = this.head;
      this.head = this.head.next;
      removedNode.next = null;
      this.length--;
      if (this.isEmpty()) {
        this.tail = null;
      }
      return removedNode.value;
    }
  }
}
