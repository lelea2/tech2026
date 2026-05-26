/**
 * Interview-style explanation:
 *
 * Problem:
 * - Mutate an array by filling it with a given value from start to end index.
 * - Handle negative indices by converting to positive equivalents.
 * - Handle out-of-bounds indices by clamping to valid range.
 * - Return the mutated array.
 *
 * Plan:
 * 1. Set default start = 0, end = array.length.
 * 2. Convert negative indices: start/end < 0 → add array.length.
 * 3. Clamp indices to [0, array.length].
 * 4. If start >= end, return early (no fill needed).
 * 5. Fill array[i] = value for i in [start, end).
 * 6. Return mutated array.
 *
 * Why this works:
 * - Negative index conversion handles backwards indexing (-1 = last element).
 * - Clamping prevents out-of-bounds writes.
 * - Early exit avoids loop if no range is valid.
 *
 * Complexity:
 * - Time: O(end - start) for the fill loop
 * - Space: O(1) (in-place mutation)
 *
 * @template T
 * @param {T[]} array
 * @param {T} value
 * @param {number} [start=0]
 * @param {number} [end=array.length]
 * @returns {T[]}
 */
export default function fill(array, value, start = 0, end = array.length) {
  let normalizedStart = start;
  let normalizedEnd = end;

  // Convert negative indices to positive
  if (normalizedStart < 0) {
    normalizedStart = Math.max(0, array.length + normalizedStart);
  }

  if (normalizedEnd < 0) {
    normalizedEnd = Math.max(0, array.length + normalizedEnd);
  }

  // Clamp to valid bounds
  normalizedStart = Math.max(0, Math.min(normalizedStart, array.length));
  normalizedEnd = Math.max(0, Math.min(normalizedEnd, array.length));

  // Fill from start to end (exclusive)
  for (let i = normalizedStart; i < normalizedEnd; i += 1) {
    array[i] = value;
  }

  return array;
}

// Example usage:
// fill([1, 2, 3], 'a'); // ['a', 'a', 'a']
// fill([4, 6, 8, 10], '*', 1, 3); // [4, '*', '*', 10]
// fill([4, 6, 8, 10, 12], '*', 1, 8); // [4, '*', '*', '*', '*']
// fill([4, 6, 8, 10, 12], '*', 8, 10); // [4, 6, 8, 10, 12]
// fill([4, 6, 8, 10, 12], '*', -3, -1); // [4, 6, '*', '*', 12]
// fill([4, 6, 8, 10, 12], '*', -10, 2); // ['*', '*', 8, 10, 12]
// fill([4, 6, 8, 10, 12], '*', -10, -8); // [4, 6, 8, 10, 12]
