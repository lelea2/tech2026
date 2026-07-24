function mergeIntervals(intervals: number[][]): number[][] {
  if (intervals.length === 0) return [];

  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const result: number[][] = [];

  let [currentStart, currentEnd] = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const [nextStart, nextEnd] = sorted[i];

    if (nextStart <= currentEnd) {
      currentEnd = Math.max(currentEnd, nextEnd);
    } else {
      result.push([currentStart, currentEnd]);
      [currentStart, currentEnd] = [nextStart, nextEnd];
    }
  }

  result.push([currentStart, currentEnd]);
  return result;
}

// O(nlog(n)) time complexity due to sorting, O(n) space complexity for the result array. 
console.log(
  mergeIntervals([
    [1, 3],
    [2, 6],
    [8, 10],
    [9, 12]
  ])
);

// [[1, 6], [8, 12]]