// O(n log n) time because of sorting
// O(1) extra space if sorting in place
/**
 * @param {number[][]} numbers
 * @return {boolean}
 */
export default function isMeetingCalendarValid(intervals) {
  // sorting intervals
  intervals.sort((a, b) => a[0] - b[0]);

  for (let i = 1; i < intervals.length; i++) {
    const prevEnd = intervals[i-1][1];
    const currentStart = intervals[i][0];

    // overlap exists between start and end time
    if (currentStart < prevEnd) {
      return false;
    }
  }

  return true;
}

/**
Input: intervals = [[1,5],[5,10],[10,15]]
Output: true
Explanation: The meetings are back-to-back but do not overlap.
=======================
Input: intervals = [[8,10],[1,3],[2,6],[15,18]]
Output: false
Explanation: The meetings [1, 3] and [2, 6] overlap, so it is not possible to attend all meetings.
 */