
/**
 * Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].
 *
 * @param {number[]} nums - The input array.
 * @return {number[]} - The array with the product of all elements except the current one.
 */
// Time complexity: O(n), Space complexity: O(n)
export default function arrayProductExcludingCurrent(nums) {
  // Time complexity: O(n), Space complexity: O(n)
  const n = nums.length;
  const result = new Array(n).fill(1); // Initialize the result array with 1s

  // Calculate the product of all elements to the left of each element
  for (let i = 1; i < n; i++) {
    result[i] = result[i - 1] * nums[i - 1];
  }

  // Calculate the product of all elements to the right of each element
  let rightProduct = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= rightProduct;
    rightProduct *= nums[i];
  }

  return result;
}