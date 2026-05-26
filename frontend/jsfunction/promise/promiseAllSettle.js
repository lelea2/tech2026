/**
 * Promise.allSettled variant that accepts an array.
 *
 * Resolves with an array of outcome objects in input order:
 * - { status: 'fulfilled', value }
 * - { status: 'rejected', reason }
 *
 * If input is empty, returns an already-fulfilled Promise with [].
 *
 * @param {Array<unknown>} iterable
 * @return {Promise<Array<{status: 'fulfilled', value: unknown} | {status: 'rejected', reason: unknown}>>}
 */
export default function promiseAllSettled(iterable) {
	if (iterable.length === 0) {
		return Promise.resolve([]);
	}

	return new Promise((resolve) => {
		const outcomes = new Array(iterable.length);
		let settledCount = 0;

		iterable.forEach((item, index) => {
			Promise.resolve(item)
				.then((value) => {
					outcomes[index] = { status: 'fulfilled', value };
				})
				.catch((reason) => {
					outcomes[index] = { status: 'rejected', reason };
				})
				.finally(() => {
					settledCount++;

					if (settledCount === iterable.length) {
						resolve(outcomes);
					}
				});
		});
	});
}

/**
Example:

const p0 = Promise.resolve(3);
const p1 = 42;
const p2 = new Promise((resolve, reject) => {
	setTimeout(() => {
		reject('foo');
	}, 100);
});

await promiseAllSettled([p0, p1, p2]);
// [
//   { status: 'fulfilled', value: 3 },
//   { status: 'fulfilled', value: 42 },
//   { status: 'rejected', reason: 'foo' },
// ]
*/
