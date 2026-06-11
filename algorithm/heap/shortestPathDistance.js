/**
 * Interview Question:
 * Given a weighted directed graph and a source node, return the shortest
 * distance from the source to every other node.
 *
 * Graph format:
 * {
 *   A: { B: 4, C: 2 },
 *   B: { C: 1, D: 5 },
 *   C: { D: 8 },
 *   D: {}
 * }
 *
 * Requirements:
 * - Use Dijkstra's algorithm
 * - Assume all edge weights are non-negative
 * - Return an object mapping each node to its shortest distance from source
 * - Use Infinity for nodes that are unreachable from the source
 * - Return an empty object when the graph is empty
 *
 * Approach:
 * Keep a distances map and a min-heap ordered by current best distance.
 * Start the source at distance 0. Each time the closest node is popped from the
 * heap, relax its outgoing edges. If a shorter path to a neighbor is found,
 * update its distance and push the new pair into the heap.
 *
 * Important detail:
 * This implementation does not decrease keys inside the heap. Instead, it may
 * push multiple entries for the same node and skips stale entries when popped.
 *
 * Complexity:
 * O((V + E) log V) time with a min-heap and O(V + E) space.
 */

/**
 * Find the shortest path from a source node to all other nodes in a weighted graph. (Dijkstra's Algorithm)
 * 
 * @param {Record<string, Record<string, number>>} graph
 * @param {string} source
 * @return {Record<string, number>}
 */
export default function dijkstra(graph, source) {
  // Always remember to handle edge cases.
  if (Object.keys(graph).length === 0) {
    return {};
  }
  const distances = {};

  // Initialize every node distance to Infinity.
  for (const node in graph) {
    distances[node] = Infinity;
  }

  // Distance from source to itself is always 0.
  distances[source] = 0;

  const minHeap = new MinHeap();
  minHeap.push([source, 0]);

  while (!minHeap.isEmpty()) {
    const [currentNode, currentDistance] = minHeap.pop();

    // If this heap entry is stale, skip it.
    // Example: we previously pushed a worse distance before finding a better one.
    if (currentDistance > distances[currentNode]) {
      continue;
    }

    const neighbors = graph[currentNode];

    for (const neighbor in neighbors) {
      const weight = neighbors[neighbor];
      const newDistance = currentDistance + weight;

      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        minHeap.push([neighbor, newDistance]);
      }
    }
  }

  return distances;
}

/**
 * MinHeap stores items like:
 * [node, distance]
 *
 * The heap is ordered by distance.
 */
class MinHeap {
  constructor() {
    this.heap = [];
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  push(value) {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) {
      return undefined;
    }

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);

    return min;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      if (this.heap[parentIndex][1] <= this.heap[index][1]) {
        break;
      }

      this.swap(parentIndex, index);
      index = parentIndex;
    }
  }

  bubbleDown(index) {
    const length = this.heap.length;

    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < length &&
        this.heap[leftChild][1] < this.heap[smallest][1]
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < length &&
        this.heap[rightChild][1] < this.heap[smallest][1]
      ) {
        smallest = rightChild;
      }

      if (smallest === index) {
        break;
      }

      this.swap(index, smallest);
      index = smallest;
    }
  }

  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}
