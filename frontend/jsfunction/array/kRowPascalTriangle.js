/**
 * Return the k-th (0-indexed) row of Pascal's triangle using O(k) space.
 *
 * @param {number} k
 * @returns {number[]}
 */
export default function getRow(k) {
  if (k < 0) {
    return [];
  }

  const row = new Array(k + 1).fill(0);
  row[0] = 1;

  // Build each row in place from right to left so previous values are preserved.
  for (let r = 1; r <= k; r += 1) {
    row[r] = 1;
    for (let c = r - 1; c > 0; c -= 1) {
      row[c] = row[c] + row[c - 1];
    }
  }

  return row;
}
