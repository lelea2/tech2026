/**
 * Merges overlapping intervals in an array.
 *
 * @param {Array<[number, number]>} intervals
 * @return {Array<[number, number]>}
 */
export default function mergeOverlappingIntervals(intervals) {
  if (intervals.length <= 1) return intervals;

  // Step 1:
  // Sort intervals by start time.
  // This makes overlapping intervals appear next to each other.
  intervals.sort((a, b) => a[0] - b[0]);

  // Step 2:
  // Start result with the first interval.
  const merged = [intervals[0]];

  // Step 3:
  // Compare each interval with the last merged interval.
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];

    const currentStart = current[0];
    const currentEnd = current[1];
    const lastEnd = last[1];

    // If current starts before or at lastEnd, they overlap.
    // Example: [1, 3] and [3, 5] overlap.
    if (currentStart <= lastEnd) {
      // Merge by extending the end if needed.
      last[1] = Math.max(lastEnd, currentEnd);
    } else {
      // Otherwise, there is a gap, so start a new interval.
      merged.push(current);
    }
  }

  return merged;
}