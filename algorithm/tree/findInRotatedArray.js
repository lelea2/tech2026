/**
 * Interview Question:
 * Given a sorted array that has been rotated at an unknown pivot and a target
 * value, return the index of the target. Return -1 if the target does not exist.
 *
 * Example:
 * numbers = [4, 5, 6, 7, 0, 1, 2], target = 0 -> 4
 * numbers = [4, 5, 6, 7, 0, 1, 2], target = 3 -> -1
 *
 * Answer:
 * Use a modified binary search. At every step, at least one half of the current
 * range must be sorted:
 * - If numbers[left] <= numbers[mid], the left half is sorted.
 * - Otherwise, the right half is sorted.
 *
 * Once we know which half is sorted, check whether the target falls inside that
 * sorted range. If it does, search that half. If not, search the other half.
 *
 * Assumption:
 * This version assumes there are no duplicate values. With duplicates, cases
 * like numbers[left] === numbers[mid] === numbers[right] need extra handling.
 *
 * Complexity:
 * O(log n) time and O(1) space.
 *
 * @param {number[]} numbers
 * @param {number} target
 * @return {number}
 */
export default function findInRotatedArray(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);

    if (numbers[mid] === target) {
      return mid;
    }

    // Left half is sorted
    if (numbers[left] <= numbers[mid]) {
      // Target is inside the sorted left half
      if (numbers[left] <= target && target < numbers[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } 
    // Right half is sorted
    else {
      // Target is inside the sorted right half
      if (numbers[mid] < target && target <= numbers[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}
