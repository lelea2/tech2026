function getAvailableTimes(schedules, dayStart = 0, dayEnd = 23) {
  const intervals = schedules.flat();

  if (intervals.length === 0) {
    return [[dayStart, dayEnd]];
  }

  // Sort all busy intervals by start time
  intervals.sort((a, b) => a[0] - b[0]);

  const merged = [];

  for (const [start, end] of intervals) {
    const last = merged[merged.length - 1];

    if (!last || start > last[1]) {
      merged.push([start, end]);
    } else {
      // Overlapping or touching intervals are merged
      last[1] = Math.max(last[1], end);
    }
  }

  const available = [];
  let current = dayStart;

  for (const [start, end] of merged) {
    if (current < start) {
      available.push([current, start]);
    }

    current = Math.max(current, end);
  }

  if (current < dayEnd) {
    available.push([current, dayEnd]);
  }

  return available;
}