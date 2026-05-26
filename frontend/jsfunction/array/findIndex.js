/**
 * Interview-style explanation:
 *
 * Problem:
 * - Find the index of the first element in an array that satisfies a predicate function.
 * - Return -1 if no element matches.
 * - Support starting search from a specific index (fromIndex).
 * - Handle negative fromIndex like array indices.
 *
 * Plan:
 * 1. Set default fromIndex = 0.
 * 2. Convert negative fromIndex to positive: max(0, array.length + fromIndex).
 * 3. Clamp to [0, array.length] to avoid invalid starting positions.
 * 4. Iterate from fromIndex to array.length.
 * 5. Invoke predicate(value, index, array) for each element.
 * 6. Return index as soon as predicate is truthy.
 * 7. Return -1 if loop completes without finding a match.
 *
 * Why this works:
 * - Negative index conversion matches standard array semantics (-1 = last element).
 * - Early return immediately gives the first matching index.
 * - -1 is a standard "not found" sentinel distinct from valid indices [0, n).
 *
 * Complexity:
 * - Time: O(n) worst case (full array scan)
 * - Space: O(1)
 *
 * @template T
 * @param {T[]} array
 * @param {(value: T, index: number, array: T[]) => unknown} predicate
 * @param {number} [fromIndex=0]
 * @returns {number}
 */
export default function findIndex(array, predicate, fromIndex = 0) {
  let startIndex = fromIndex;

  // Convert negative fromIndex to positive
  if (startIndex < 0) {
    startIndex = Math.max(0, array.length + startIndex);
  }

  // Clamp to valid bounds
  startIndex = Math.max(0, Math.min(startIndex, array.length));

  // Iterate from startIndex and return first match
  for (let i = startIndex; i < array.length; i += 1) {
    if (predicate(array[i], i, array)) {
      return i;
    }
  }

  // No match found
  return -1;
}

// Example usage:
// findIndex([1, 2, 3, 4, 5], (v) => v > 3); // 3 (index of 4)
// findIndex([1, 2, 3, 4, 5], (v) => v > 10); // -1 (no match)
// findIndex([1, 2, 3, 4, 5], (v) => v > 2, 2); // 3 (start from index 2)
// findIndex(['a', 'b', 'c'], (v, i) => i === 1); // 1
// findIndex([1, 2, 3, 4, 5], (v) => v > 3, -2); // 3 (negative fromIndex: -2 = index 3)
