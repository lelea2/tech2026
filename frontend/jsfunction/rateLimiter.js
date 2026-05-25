/**
 * Accept/reject each task based on how many previously accepted tasks
 * still fall inside a fixed window ending at the current timestamp.
 *
 * Rules:
 * - timestamps is sorted in non-decreasing order.
 * - Only accepted tasks consume capacity.
 * - Rejected tasks do not affect future decisions.
 *
 * @param {number[]} timestamps
 * @param {number} maxAllowed
 * @param {number} windowLen
 * @returns {boolean[]}
 */
export default function rateLimit(timestamps, maxAllowed, windowLen) {
	// Initialize all decisions as rejected by default.
	const accepted = new Array(timestamps.length).fill(false);

	// If there are no tasks or no capacity, return all-false immediately.
	if (timestamps.length === 0 || maxAllowed <= 0) {
		// Nothing can be accepted in this scenario.
		return accepted;
	}

	// Keep accepted timestamps in order so we can evict expired ones quickly.
	const acceptedWindow = [];
	// Head points to the first still-valid accepted timestamp.
	let head = 0;

	// Process tasks in sorted timestamp order.
	for (let i = 0; i < timestamps.length; i++) {
		// Current task timestamp.
		const currentTs = timestamps[i];
		// Oldest timestamp still included in current window.
		const windowStart = currentTs - windowLen;

		// Remove accepted tasks that are outside (currentTs - windowLen, currentTs].
		while (head < acceptedWindow.length && acceptedWindow[head] <= windowStart) {
			// Move head forward to discard one expired accepted timestamp.
			head++;
		}

		// Count accepted tasks that are still active inside the window.
		const activeAccepted = acceptedWindow.length - head;

		// Accept only if the active accepted count is below the limit.
		if (activeAccepted < maxAllowed) {
			// Mark this task as accepted in the output array.
			accepted[i] = true;
			// Add accepted timestamp so it affects future decisions.
			acceptedWindow.push(currentTs);
		}
	}

	// Return per-task acceptance decisions.
	return accepted;
}
