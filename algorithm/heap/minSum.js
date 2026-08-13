// Given an array of positive integers and k operations, on each operation choose an element x and replace it with ceil(x / 2). 
// Return the minimum possible sum after exactly k operations.
// Example: nums = [10, 20, 7], k = 2
// Output: 22 (20 -> 10, then 10 -> 5; final sum = 10 + 5 + 7)

function minSum(nums, k) {
  const heap = new MaxHeap();
  for (const num of nums) {
    heap.push(num);
  }
  while (k-- > 0) {
    const max = heap.pop();
    // Equivalent to Math.ceil(max / 2)
    const reduced = Math.ceil(max / 2);
    heap.push(reduced);
  }

  let sum = 0;
  while (heap.size() > 0) {
    sum += heap.pop();
  }

  return sum;
}

class MaxHeap {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  push(value) {
    this.heap.push(value);
    let i = this.heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent] >= this.heap[i]) break;
      [this.heap[parent], this.heap[i]] =
        [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  pop() {
    const max = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      let i = 0;
      while (true) {
        let largest = i;
        const left = i * 2 + 1;
        const right = i * 2 + 2;
        if (
          left < this.heap.length &&
          this.heap[left] > this.heap[largest]
        ) {
          largest = left;
        }

        if (
          right < this.heap.length &&
          this.heap[right] > this.heap[largest]
        ) {
          largest = right;
        }
        if (largest === i) break;
        [this.heap[i], this.heap[largest]] =
          [this.heap[largest], this.heap[i]];
        i = largest;
      }
    }

    return max;
  }
}

// Time complexity: O(n log n + k log n) - building the heap takes O(n log n), and each of the k operations takes O(log n) for pop and push.
// space complexity: O(n) - for the heap storage.