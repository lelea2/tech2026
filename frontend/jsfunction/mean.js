/**
 * @param {number[]} array
 * @returns {number}
 */
export default function mean(array) {
	if (array.length === 0) {
		return NaN;
	}

	let sum = 0;
	for (let i = 0; i < array.length; i += 1) {
		sum += array[i];
	}

	return sum / array.length;
}
