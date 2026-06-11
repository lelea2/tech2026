/**
 * Interview Study Notes:
 * Implement a Max Heap data structure using an array.
 *
 * Heap properties:
 * - Complete binary tree: every level is filled left to right
 * - Max-heap order: every parent value is greater than or equal to its children
 * - The maximum value is always at index 0
 *
 * Array index formulas:
 * - parent index: Math.floor((index - 1) / 2)
 * - left child index: index * 2 + 1
 * - right child index: index * 2 + 2
 *
 * Core operations:
 * - heapify(array): build a heap from an unsorted array in O(n)
 * - insert(value): add to the end, then sift up in O(log n)
 * - delete(): remove max/root, move last value to root, then sift down in O(log n)
 * - findMax(): read heap[0] in O(1)
 *
 * Common interview follow-ups:
 * - Why is heapify O(n), not O(n log n)?
 * - How would this change for a min heap?
 * - How can a heap be used for priority queues, top K problems, or heap sort?
 */

export default class Heap {
  constructor(array = []) {
    this.heap = [];
    this.heapify(array);
  }

  /**
   * Constructs the initial heap structure with a given `array`.
   * Time: O(n)
   * @param {Array<number>} array The initial array.
   */
  heapify(array) {
    this.heap = array.slice();

    // Start from the last non-leaf node and sift down.
    for (let i = this.parentIndex(this.heap.length - 1); i >= 0; i--) {
      this.siftDown(i);
    }
  }

  /**
   * Adds an item into the heap.
   * Time: O(log n)
   * @param {number} value The item to be added into the heap.
   */
  insert(value) {
    this.heap.push(value);
    this.siftUp(this.heap.length - 1);
  }

  /**
   * Removes the top of the heap / maximum element.
   * Time: O(log n)
   * @return {number | undefined} The element removed.
   */
  delete() {
    if (this.heap.length === 0) {
      return undefined;
    }

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const max = this.heap[0];

    // Move last element to root, then restore heap.
    this.heap[0] = this.heap.pop();
    this.siftDown(0);

    return max;
  }

  /**
   * Returns the value of the maximum element.
   * Time: O(1)
   * @return {number | undefined} The maximum element.
   */
  findMax() {
    return this.heap[0];
  }

  /**
   * Returns heap size.
   * @return {number}
   */
  size() {
    return this.heap.length;
  }

  /**
   * Checks whether heap is empty.
   * @return {boolean}
   */
  isEmpty() {
    return this.heap.length === 0;
  }

  /**
   * Move a node up until max heap property is restored.
   * Parent should always be >= child.
   * @param {number} index
   */
  siftUp(index) {
    while (index > 0) {
      const parent = this.parentIndex(index);

      if (this.heap[parent] >= this.heap[index]) {
        break;
      }

      this.swap(parent, index);
      index = parent;
    }
  }

  /**
   * Move a node down until max heap property is restored.
   * @param {number} index
   */
  siftDown(index) {
    const length = this.heap.length;

    while (true) {
      const left = this.leftChildIndex(index);
      const right = this.rightChildIndex(index);
      let largest = index;

      if (left < length && this.heap[left] > this.heap[largest]) {
        largest = left;
      }

      if (right < length && this.heap[right] > this.heap[largest]) {
        largest = right;
      }

      if (largest === index) {
        break;
      }

      this.swap(index, largest);
      index = largest;
    }
  }

  parentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  leftChildIndex(index) {
    return index * 2 + 1;
  }

  rightChildIndex(index) {
    return index * 2 + 2;
  }

  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}
