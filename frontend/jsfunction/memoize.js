/**
 * Memoize a single-argument function where argument is string or number.
 *
 * @param {(arg: string | number) => unknown} func
 * @returns {(arg: string | number) => unknown}
 */
export default function memoize(func) {
	const cache = new Map();

	return function(arg) {
		if (cache.has(arg)) {
			return cache.get(arg);
		}

		const result = func.call(this, arg);
		cache.set(arg, result);
		return result;
	};
}

/**
Example:

let calls = 0;
const slowSquare = (x) => {
	calls += 1;
	return x * x;
};

const memoized = memoize(slowSquare);
memoized(4); // 16, calls = 1
memoized(4); // 16, calls = 1 (cached)
memoized(5); // 25, calls = 2
*/
