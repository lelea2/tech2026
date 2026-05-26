/**
 * Restrict value to the inclusive range [lower, upper].
 *
 * @param {number} value
 * @param {number} lower
 * @param {number} upper
 * @returns {number}
 */
export default function clamp(value, lower, upper) {
	return Math.min(Math.max(value, lower), upper);
}

// Examples:
// clamp(3, 0, 5);      // 3
// clamp(-10, -3, 5);   // -3
// clamp(10, -5, 5);    // 5
