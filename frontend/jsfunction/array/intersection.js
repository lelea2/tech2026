/**
 * Computes the intersection of arrays, returning a new array containing unique values present in all given arrays.
 *
 * @param {Array[]} arrays - The arrays to perform the intersection on.
 * @returns {Array} - A new array containing the unique values present in all given arrays.
 */
export default function intersection(...arrays) {
  if (arrays.length === 0) {
    return [];
  }
  return [...new Set(arrays[0])].filter((item) =>
    arrays.every((arr) => arr.includes(item)),
  );
}