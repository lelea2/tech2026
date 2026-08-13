// Find every index in `str1` whose removal makes `str1` equal to `str2`.
// Return [-1] when no character can be removed to make the strings equal.
//
// Example:
// Input: str1 = 'abcd', str2 = 'acd'
// Output: [1] because removing 'b' at index 1 produces 'acd'.
//
// Steps:
// 1. Confirm that `str1` contains exactly one more character than `str2`.
// 2. Scan from the left to find the first position where the strings differ.
// 3. Skip that character in `str1` and verify that all remaining characters match.
// 4. Include adjacent matching characters that are also valid removal positions.
// 5. Return the valid indices, or [-1] if removing a character does not fix the mismatch.
function getRemovableIndices(str1, str2) {
  if (str1.length !== str2.length + 1) {
    return [-1];
  }

  const n = str2.length;

  // 1. Find first mismatch
  let i = 0;

  while (i < n && str1[i] === str2[i]) {
    i++;
  }

  // If everything matches, the extra char is at the end
  if (i === n) {
    return [n];
  }

  // 2. Verify that deleting str1[i] actually fixes the rest
  let j = i;

  while (j < n && str1[j + 1] === str2[j]) {
    j++;
  }

  if (j !== n) {
    return [-1];
  }

  // 3. Any identical chars immediately to the right
  //    of the mismatch are also valid removal positions
  const result = [i];

  let k = i + 1;

  while (k < str1.length && str1[k] === str1[i]) {
    result.push(k);
    k++;
  }

  return result;
}