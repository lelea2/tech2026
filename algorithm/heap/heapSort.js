/**
 * Sorts an array of integers in ascending order using heap sort.
 * The input array is modified in-place.
 *
 * Time: O(n log n)
 * Space: O(1)
 *
 * @param {number[]} arr
 * @returns {number[]}
 */
export default function heapSort(arr) {
  const n = arr.length;

  // Step 1: Build a max heap from the array.
  // Last parent index is Math.floor(n / 2) - 1.
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  // Step 2: Repeatedly move the max element to the end.
  for (let end = n - 1; end > 0; end--) {
    swap(arr, 0, end);

    // Restore max heap property for the reduced heap.
    heapify(arr, end, 0);
  }

  return arr;
}

/**
 * Restores the max heap property starting from index i.
 *
 * @param {number[]} arr
 * @param {number} heapSize
 * @param {number} i
 */
function heapify(arr, heapSize, i) {
  let largest = i;

  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < heapSize && arr[left] > arr[largest]) {
    largest = left;
  }

  if (right < heapSize && arr[right] > arr[largest]) {
    largest = right;
  }

  // If parent is not the largest, swap and continue heapifying.
  if (largest !== i) {
    swap(arr, i, largest);
    heapify(arr, heapSize, largest);
  }
}

function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

/**
 * Recap:
 * Heap sort is a comparison-based sorting algorithm.
 *
 * It works by:
 * 1. Building the unsorted array into a max heap.
 * 2. Using the max heap to repeatedly find the largest element.
 * 3. Swapping the largest element to the end of the unsorted portion.
 * 4. Shrinking the heap and restoring the max heap property.
 *
 * Max Heap:
 * A binary heap is a partially ordered complete binary tree that satisfies
 * a heap property.
 *
 * Max heap property:
 * - Every parent node must be greater than or equal to its child nodes.
 * - The largest value is always at the root of the heap.
 * - The order between sibling nodes does not matter.
 *
 * Complete binary tree:
 * - All levels are completely filled except possibly the last level.
 * - The last level is filled from left to right.
 *
 * Array representation of a heap:
 * For a node at index parentIdx:
 *
 * left child index  = 2 * parentIdx + 1
 * right child index = 2 * parentIdx + 2
 *
 * How Heap Sort Works:
 * 1. Build a max heap from the input array.
 * 2. Swap the root, which is the largest value, with the last element.
 * 3. Treat the last element as sorted.
 * 4. Heapify the remaining unsorted portion.
 * 5. Repeat until the entire array is sorted in ascending order.
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(1)
 *
 * Notes:
 * - Heap sort modifies the input array in-place.
 * - Heap sort is not stable, meaning equal values may not keep their
 *   original relative order.
 */