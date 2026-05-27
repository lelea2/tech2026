/**
 * @param {Array|Object} value
 * @return {Array|Object}
 */
export default function compact(value) {
  // Handle arrays.
  if (Array.isArray(value)) {
    const result = [];

    for (const item of value) {
      // Recursively compact nested values.
      const compactedItem = compact(item);

      // Only keep truthy values.
      if (Boolean(compactedItem)) {
        result.push(compactedItem);
      }
    }

    return result;
  }

  // Handle objects (but exclude null because typeof null === 'object').
  if (value !== null && typeof value === 'object') {
    const result = {};

    for (const key in value) {
      // Recursively compact nested values.
      const compactedValue = compact(value[key]);

      // Only keep truthy values.
      if (Boolean(compactedValue)) {
        result[key] = compactedValue;
      }
    }

    return result;
  }

  // Primitive values are returned as-is.
  return value;
}

/**
compact([0, 1, false, 2, '', 3, null]); // => [1, 2, 3]
compact({ foo: true, bar: null }); // => { foo: true }
 */