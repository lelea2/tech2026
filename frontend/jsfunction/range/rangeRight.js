/**
 * Creates an array of numbers progressing
 * from start up to, but not including, end,
 * then returns it in reverse order.
 *
 * @param {number} [start=0]
 * @param {number} end
 * @param {number} [step]
 * @returns {number[]}
 */
export default function rangeRight(start = 0, end, step) {
  // Handle single argument case
  // rangeRight(4) -> start=0, end=4
  if (end === undefined) {
    end = start;
    start = 0;
  }

  // Return empty array if same
  if (start === end) {
    return [];
  }

  // Default step direction
  if (step === undefined) {
    step = start < end ? 1 : -1;
  }

  const result = [];

  // Handle step = 0
  if (step === 0) {
    const length = Math.max(end - start, 0);
    for (let i = 0; i < length; i++) {
      result.push(start);
    }
    return result;
  }

  // Positive direction
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else { // Negative direction
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }

  // Reverse final result
  return result.reverse();
}

/**
 * rangeRight(4); // => [3, 2, 1, 0]
rangeRight(-4); // => [-3, -2, -1, 0]
rangeRight(1, 5); // => [4, 3, 2, 1]
rangeRight(0, 20, 5); // => [15, 10, 5, 0]
rangeRight(0, -4, -1); // => [-3, -2, -1, 0]
rangeRight(1, 4, 0); // => [1, 1, 1]
 */