/**
 * 3Sum lesson: find all unique triplets that sum to zero.
 *
 * Problem statement:
 * Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]]
 * with i, j, k distinct and nums[i] + nums[j] + nums[k] == 0.
 *
 * Why two pointers works:
 * 1) Sort the array so duplicates become adjacent and pointer movement is meaningful.
 * 2) Fix one value at index i.
 * 3) Search pairs in the subarray i+1..end using left/right pointers.
 * 4) Move pointers based on the sum:
 *    - sum < 0: move left rightward to increase sum.
 *    - sum > 0: move right leftward to decrease sum.
 *    - sum == 0: record triplet and skip duplicates on both sides.
 *
 * Complexity:
 * - Time: O(n^2)
 * - Extra space: O(1) excluding output
 *
 * Mini quiz (answers at bottom):
 * Q1: Why must we skip repeated nums[i] values?
 * Q2: After finding a valid triplet, why skip duplicate left/right values?
 * Q3: Why can we stop early when sortedNums[i] > 0?
 */

/**
 * @param {number[]} nums
 * @returns {number[][]}
 */
export default function threeSum(nums) {
  // sort array first
  const sortedNums = [...nums].sort((a, b) => a - b);
  const n = sortedNums.length;
  const triplets = [];

  for (let i = 0; i < n - 2; i++) {
    const current = sortedNums[i];

    // Early stop: once the fixed number is positive, all following are >= current.
    if (current > 0) {
      break;
    }

    // Skip duplicate anchors to avoid duplicate triplets.
    if (i > 0 && current === sortedNums[i - 1]) {
      continue;
    }

    let left = i + 1;
    let right = n - 1;

    while (left < right) {
      const total = current + sortedNums[left] + sortedNums[right];

      if (total < 0) {
        left++;
      } else if (total > 0) {
        right--;
      } else {
        triplets.push([current, sortedNums[left], sortedNums[right]]);
        left++;
        right--;

        // Skip duplicate pair values after recording a valid triplet.
        while (left < right && sortedNums[left] === sortedNums[left - 1]) {
          left++;
        }
        while (left < right && sortedNums[right] === sortedNums[right + 1]) {
          right--;
        }
      }
    }
  }

  return triplets;
}

// Practice checks:
// console.log(threeSum([-1, 0, 1, 2, -1, -4])); // [[-1, -1, 2], [-1, 0, 1]]
// console.log(threeSum([0, 1, 1]));             // []
// console.log(threeSum([0, 0, 0, 0]));          // [[0, 0, 0]]


//  * Mini quiz (answers at bottom):
//  * Q1: Why must we skip repeated nums[i] values?
//  * Q2: After finding a valid triplet, why skip duplicate left/right values?
//  * Q3: Why can we stop early when sortedNums[i] > 0?
// Mini quiz answers:
// A1: Repeated anchors regenerate the same pair search and duplicate triplets.
// A2: Adjacent duplicates would output the same value triplet multiple times.
// A3: If the fixed value is already > 0, every possible triplet sum is > 0.
