
/**
 * Reverse the bits of a 32-bit unsigned integer.
 *
 * @param {number} n - The input number.
 * @return {number} - The number with its bits reversed.
 */
// Time complexity: O(1), Space complexity: O(1)
export default function reverseBits(n) {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    // Shift the result to the left to make room for the next bit.
    result = (result << 1) | (n & 1);
    // Shift n to the right to get the next bit.
    n = n >>> 1;
  }
  return result >>> 0;
}