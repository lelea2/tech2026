/**
 * Interview Question:
 * Given a sorted array that has been rotated at an unknown pivot, find the
 * smallest element.
 *
 * Example:
 * [4, 5, 6, 7, 0, 1, 2] -> 0
 * [11, 13, 15, 17] -> 11
 *
 * Answer:
 * Use binary search. Compare the middle value with the rightmost value:
 * - If numbers[mid] > numbers[right], the minimum must be to the right of mid
 *   because mid is still in the larger rotated-left portion.
 * - Otherwise, the minimum is at mid or to the left of mid, so keep mid in the
 *   search range by moving right = mid.
 *
 * Assumption:
 * This version assumes there are no duplicate values. If duplicates are allowed,
 * the numbers[mid] === numbers[right] case needs special handling.
 *
 * Complexity:
 * O(log n) time and O(1) space.
 */

/**
 * @param {number[]} numbers
 * @return {number}
 */
export default function smallestInRotatedArray(numbers) {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const mid = Math.floor(left + (right - left) / 2);
    // if mid > right value, minimum should be on the right side
    if (numbers[mid] > numbers[right]) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return numbers[left];
}
