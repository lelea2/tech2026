/**
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 */
export default function isEmpty(value) {
  // Step 1:
  // Handle null and undefined early because they are considered empty.
  if (value == null) {
    return true;
  }

  // Step 2:
  // Arrays and strings use `.length` to determine emptiness.
  // Examples:
  // [] => empty
  // '' => empty
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0;
  }

  // Step 3:
  // Maps and Sets use `.size` instead of `.length`.
  // Examples:
  // new Map() => empty
  // new Set() => empty
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }

  // Step 4:
  // For plain objects, check if there are any own enumerable keys.
  // Object.keys(obj) returns an array of keys.
  // If length is 0, the object is empty.
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  // Step 5:
  // Remaining primitive values (number, boolean, symbol, etc.)
  // are treated as empty according to the prompt.
  return true;
}

/**
isEmpty(undefined); // => true
isEmpty(''); // => true
isEmpty(true); // => true
isEmpty(1); // => true
isEmpty(new Map()); // => true
isEmpty([1, 2, 3]); // => false
isEmpty({ a: 1 }); // => false
 */