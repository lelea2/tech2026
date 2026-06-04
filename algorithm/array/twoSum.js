/**
 * Find two numbers in an array that add up to a target.
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