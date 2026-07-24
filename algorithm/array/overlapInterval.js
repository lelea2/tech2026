function oddOverlapIntervals(intervals) {
  const events = new Map();

  for (const [start, end] of intervals) {
    if (start >= end) {
      throw new Error(`Invalid interval: [${start}, ${end}]`);
    }

    events.set(start, (events.get(start) ?? 0) + 1);
    events.set(end, (events.get(end) ?? 0) - 1);
  }

  // Events: events = Map { 1 => 1, 7 => -1, 3 => 1, 5 => -1, 4 => 1, 9 => -1}
  const points = [...events.keys()].sort((a, b) => a - b);
  // after sorting [1, 3, 4, 5, 7, 9]

  const result = [];
  let activeCount = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    activeCount += events.get(current);

    if (activeCount % 2 === 1) {
      result.push([current, next]);
    }
  }

  return result;
}

console.log(
  oddOverlapIntervals([
    [1, 7],
    [3, 5],
    [4, 9]
  ])
);

// [[1, 3], [4, 5], [7, 9]]