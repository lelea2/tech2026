/**
 * Interview-style explanation:
 *
 * Problem:
 * - Remove elements from the RIGHT end of the array while predicate is truthy.
 * - Stop at the first element from the right where predicate is falsey.
 * - Return kept prefix as a NEW array (do not mutate input).
 *
 * Plan:
 * 1. Start from the last index and move left.
 * 2. Invoke predicate(value, index, array) at each step.
 * 3. Keep moving left while predicate is truthy.
 * 4. Once falsey is found, slice up to that index (inclusive).
 *
 * Why this works:
 * - Only trailing elements are candidates to drop.
 * - First falsey from the right marks exact cut point.
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
export default function dropRightWhile(array, predicate) {
	let cutIndex = array.length;

	for (let i = array.length - 1; i >= 0; i -= 1) {
		if (predicate(array[i], i, array)) {
			cutIndex = i;
			continue;
		}

		break;
	}

	return array.slice(0, cutIndex);
}

// Example usage:
// dropRightWhile([1, 2, 3, 4], (v) => v > 2); // => [1, 2]
// dropRightWhile([1, 2, 3], () => true); // => []
// dropRightWhile([1, 2, 3], () => false); // => [1, 2, 3]
