/**
 * Interview Question:
 * Given an integer array, find the maximum possible sum of any contiguous
 * subarray.
 *
 * Requirements:
 * - The subarray must contain consecutive elements
 * - Return the largest sum, not the subarray itself
 * - Handle arrays with negative numbers
 * - Return 0 for an empty or invalid input in this implementation
 *
 * Approach:
 * Use Kadane's Algorithm. At each number, decide whether it is better to:
 * - Start a new subarray at the current number
 * - Extend the previous subarray by adding the current number
 *
 * Track:
 * - currentSum: best subarray sum ending at the current index
 * - maxSum: best subarray sum seen anywhere so far
 *
 * Complexity:
 * O(n) time and O(1) space.
 */

/**
 * Finds the maximum sum of a contiguous subarray within the given array.
 * @param {number[]} arr
 * @returns {number}
 */
// Kadane's Algorithm
/**
 * @param {number[]} numbers
 * @return {number}
 */
export default function maxSumSubArray(numbers) {
  if (!numbers || numbers.length === 0) {
    return 0;
  }
  let maxSum = numbers[0];
  let currentSum = numbers[0];

  for (let i = 1; i < numbers.length; i++) {
    currentSum = Math.max(numbers[i], currentSum + numbers[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}
