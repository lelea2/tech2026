/**
 * Interview-style explanation:
 *
 * Problem:
 * - Remove elements from the LEFT end of the array while predicate is truthy.
 * - Stop at the first element from the left where predicate is falsey.
 * - Return kept suffix as a NEW array (do not mutate input).
 *
 * Plan:
 * 1. Start from index 0 and move right.
 * 2. Invoke predicate(value, index, array) at each step.
 * 3. Keep moving right while predicate is truthy.
 * 4. Once falsey is found, slice from that index to end.
 *
 * Why this works:
 * - Only leading elements are candidates to drop.
 * - First falsey from the left marks exact cut point.
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(k) for returned slice
 *
 * @template T
 * @param {T[]} array
 * @param {(value: T, index: number, array: T[]) => unknown} predicate
 * @returns {T[]}
 */
export default function dropWhile(array, predicate) {
  let cutIndex = 0;

  for (let i = 0; i < array.length; i += 1) {
    if (predicate(array[i], i, array)) {
      cutIndex = i + 1;
      continue;
    }

    break;
  }

  return array.slice(cutIndex);
}

// Example usage:
// dropWhile([1, 2, 3, 4, 5], (v) => v < 3); // => [3, 4, 5]
// dropWhile([1, 2, 3], (v) => v < 6); // => []
// dropWhile([1, 2, 3, 4, 5], (v) => v > 6); // => [1, 2, 3, 4, 5]
// dropWhile([1, 2, 3, 4, 5], (_v, i) => i < 3); // => [4, 5]
// dropWhile([4, 5, 12, 10, 11], (v, _i, arr) => v < arr[2]); // => [12, 10, 11]
