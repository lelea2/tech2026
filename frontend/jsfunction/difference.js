/**
 * @param {unknown[]} array
 * @param {unknown[]} values
 * @returns {unknown[]}
 */
export default function difference(array, values) {
  return array.filter((item, index) => {
    // Skip sparse array holes
    if (!(index in array)) {
      return false;
    }

    // Check if item is in values
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      // Handle NaN comparison
      if (Number.isNaN(item) && Number.isNaN(value)) {
        return false;
      }
      // Regular equality check
      if (item === value) {
        return false;
      }
    }

    return true;
  });
}

// Example usage:
// difference([1, 2, 3], [2, 3]); // => [1]
// difference([1, 2, 3, 4], [2, 3, 1]); // => [4]
// difference([1, NaN, 2], [NaN]); // => [1, 2]
// difference([1, 2, 3], [2, 3, 1, 4]); // => []
// difference([1, , 3], [1]); // => [3]
