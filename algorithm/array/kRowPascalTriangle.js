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


// Or another logic
function pascalLines(n) {
  function getPascalLine(prevLine) {
    const res = [1]; //start array with 1
    for (let i = 0; i < prevLine.length - 1; i++) {
        es.push(prevLine[i] + prevLine[i+1]);
    }
    res.push(1); //always end array with 1
    return res;
  }

  const lines = []; //array of array
  if (n > 0) {
    lines.push([1]); //generate the first element of pascal triangle, which is always 1

    for (let i = 1; i < n; i++) { //loop through the height of pascal triangle, start at 1 instead of 0
      lines.push(getPascalLine(lines[i-1]));
    }
  }
  return lines;
}