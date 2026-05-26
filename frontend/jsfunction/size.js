/**
 * Gets the size of `collection` by returning its length for array-like values or the number of own enumerable string keyed properties for objects.
 *
 * @param {Array | Object | Map | Set | string | null | undefined} collection The collection to inspect.
 * @returns {number} Returns the collection size.
 */
export default function size(collection) {
  // Handle null / undefined

  if (collection == null) {
    return 0;
  }

  // Arrays and strings

  if (
    Array.isArray(collection) ||
    typeof collection === 'string'
  ) {
    return collection.length;
  }

  // Map and Set
  if (
    collection instanceof Map ||
    collection instanceof Set
  ) {
    return collection.size;
  }

  // Plain objects
  if (typeof collection === 'object') {
    return Object.keys(collection).length;
  }

  // Unsupported types
  return 0;
}