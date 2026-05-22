
// A deep clone makes a copy of a JavaScript value such that the copy has no shared references to nested arrays or objects in the original. 
// Mutating the cloned value should never affect the original.
/**
 * @template T
 * @param {T} value
 * @return {T}
 */
export default function deepClone(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item));
  }

  const cloned = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      cloned[key] = deepClone(value[key]);
    }
  }

  return cloned;
}