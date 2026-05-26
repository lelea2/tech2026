/**
 * @param {number} value The number to check.
 * @param {number} [start=0] The start of the range.
 * @param {number} end The end of the range.
 * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
 */
export default function inRange(value, start, end) {
  // If only 2 arguments are provided
  if (end === undefined) {
    end = start;
    start = 0;
  }

  // Swap if start > end
  if (start > end) {
    [start, end] = [end, start];
  }

  return value >= start && value < end;
}