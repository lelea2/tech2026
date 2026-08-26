function maxSlidingWindow(nums, k) {
  if (!nums.length || k <= 0) return [];

  const result = [];
  const deque = []; // stores indices
  let head = 0;

  for (let i = 0; i < nums.length; i++) {
    // 1. Remove indices that are outside the current window
    while (head < deque.length && deque[head] <= i - k) {
      head++;
    }

    // 2. Remove smaller values from the back.
    // They can never become the max while nums[i] is in the window.
    while (
      deque.length > head &&
      nums[deque[deque.length - 1]] <= nums[i]
    ) {
      deque.pop();
    }

    // 3. Add current index
    deque.push(i);

    // 4. Once the first full window is formed,
    // the front is the maximum.
    if (i >= k - 1) {
      result.push(nums[deque[head]]);
    }
  }

  return result;
}

console.log(
  maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3)
);
// [3, 3, 5, 5, 6, 7]

console.log(
  maxSlidingWindow([1, -1, -2, 3, 4, 2], 2)
);
// [1, -1, 3, 4, 4]

// Explanation of the algorithm:
// 1. We maintain a deque (double-ended queue) that stores indices of elements in the current window.
// 2. For each new element, we first remove indices that are outside the current window (i - k).
// 3. Then, we remove all indices from the back of the deque whose corresponding values are less than or equal to the current element. This ensures that the deque is always in decreasing order of values.
// 4. We add the current index to the deque.
// 5. Once we have processed at least k elements, we add the value at the front of the deque (the maximum for the current window) to the result array.
