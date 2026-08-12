/**
 * Find two numbers in an array that add up to a target.
 * Input: numbers = [2, 7, 11, 15], target = 9
 * Output: [0, 1]
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */
export default function twoSum(numbers, target) {
  const map = new Map();

  for (let i = 0; i < numbers.length; i++) {
    const complement = target - numbers[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(numbers[i], i);
  }

  return [];
}

// Time complexity: O(n) - single pass through the array
// Space complexity: O(n) - hash map to store numbers and their indices