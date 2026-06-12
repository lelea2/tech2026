/**
 * Interview Question:
 * Given an integer array, find the maximum product of any contiguous subarray.
 *
 * Example:
 * [2, 3, -2, 4] -> 6 because [2, 3] has product 6
 * [-2, 0, -1] -> 0 because the best contiguous product is 0
 *
 * Key idea:
 * Track both the maximum and minimum product ending at the current index.
 * The minimum matters because multiplying by a negative number can turn the
 * smallest negative product into the largest positive product.
 *
 * Complexity:
 * O(n) time and O(1) space.
 *
 * @param {number[]} numbers
 * @return {number}
 */
export default function maxProductSubarray(numbers) {
  // Empty input has no subarray, so this implementation returns 0.
  if (numbers.length === 0) {
    return 0;
  }

  // maxProduct is the largest product of a subarray ending at the current index.
  let maxProduct = numbers[0];

  // minProduct is the smallest product of a subarray ending at the current index.
  // It is kept because a negative number can flip it into a new maximum.
  let minProduct = numbers[0];

  // result stores the best product seen anywhere in the array so far.
  let result = numbers[0];

  // Start from index 1 because index 0 initializes the running products.
  for (let i = 1; i < numbers.length; i++) {
    // Current value we are deciding to start from or extend into.
    const num = numbers[i];

    // If num is negative, multiplying by it swaps the role of max and min.
    // Example: max=3, min=-12, num=-2 -> max candidate comes from min * num.
    if (num < 0) {
      [maxProduct, minProduct] = [minProduct, maxProduct];
    }

    // Choose between starting a new subarray at num or extending the old max.
    maxProduct = Math.max(num, maxProduct * num);

    // Choose between starting a new subarray at num or extending the old min.
    minProduct = Math.min(num, minProduct * num);

    // Update the global best with the best subarray ending at this index.
    result = Math.max(result, maxProduct);
  }

  // Return the maximum product found across all contiguous subarrays.
  return result;
}
