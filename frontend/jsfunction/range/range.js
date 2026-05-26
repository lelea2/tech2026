/**
 * Creates an array of numbers progressing
 * from start up to, but not including, end.
 *
 * @param {number} [start=0]
 * @param {number} end
 * @param {number} [step]
 * @returns {number[]}
 */
export default function range(start = 0, end, step) {
  // Handle single argument case
  if (end === undefined) {
    end = start;
    start = 0;
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

  // Positive step
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else { // Negative step
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }

  return result;
}

/**
 * test('negative end value', () => {
  expect(range(-4)).toEqual([0, -1, -2, -3]);

  expect(range(-9, -4, 1)).toEqual([
    -9,
    -8,
    -7,
    -6,
    -5,
  ]);

  expect(range(8, -2, -3)).toEqual([
    8,
    5,
    2,
    -1,
  ]);
});
 */