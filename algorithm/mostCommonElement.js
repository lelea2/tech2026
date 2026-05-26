/**
 * Interview-style explanation:
 *
 * Problem:
 * - Return the k numbers that appear most frequently in the input array.
 * - Result order is not important.
 *
 * Plan:
 * 1. Count frequency of each number using a hash map (Map in JavaScript).
 * 2. Convert the map into [number, count] pairs.
 * 3. Sort pairs by count in descending order.
 * 4. Take the first k pairs and return only their number values.
 *
 * Why this works:
 * - The map guarantees we know the exact occurrence count of every unique number.
 * - Sorting by count descending places the most frequent elements first.
 * - Taking the first k after sorting gives exactly the k most frequent numbers.
 * - The prompt guarantees a unique result, so tie ambiguity is not a concern.
 *
 * Complexity:
 * - Let n be numbers.length and u be number of unique values.
 * - Counting: O(n)
 * - Sorting unique entries: O(u log u)
 * - Total: O(n + u log u)
 * - Extra space: O(u)
 *
 * @param {number[]} numbers
 * @param {number} k
 * @returns {number[]}
 */
export default function mostCommonElement(numbers, k) {
  // Step 1: build frequency table.
  const frequency = new Map();

  for (const num of numbers) {
    frequency.set(num, (frequency.get(num) ?? 0) + 1);
  }

  // Step 2-4: sort by frequency, keep top k, and extract the number values.
  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([num]) => num);
}

// Example usage:
// mostCommonElement([4, 4, 4, 6, 6, 5, 5, 5], 2); // => [4, 5]
// mostCommonElement([7, 7, 7, 8, 8, 9, 9, 9], 3); // => [7, 9, 8]
// mostCommonElement([10, 10, 10, 10, 10], 1); // => [10]
