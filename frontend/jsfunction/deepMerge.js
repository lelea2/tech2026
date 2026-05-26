/**
 * @param {object} objA
 * @param {object} objB
 * @returns {object}
 */
export default function deepMerge(objA, objB) {
  // Support merging when the root values are arrays.
  if (Array.isArray(objA) && Array.isArray(objB)) {
    return [...objA.map(deepCopy), ...objB.map(deepCopy)];
  }

  const result = {};

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  const allKeys = new Set([...keysA, ...keysB]);

  for (const key of allKeys) {
    const valA = objA[key];
    const valB = objB[key];
    const inA = Object.prototype.hasOwnProperty.call(objA, key);
    const inB = Object.prototype.hasOwnProperty.call(objB, key);

    if (inA && !inB) {
      // Key only in objA: deep copy to avoid sharing references.
      result[key] = deepCopy(valA);
    } else if (!inA && inB) {
      // Key only in objB: deep copy.
      result[key] = deepCopy(valB);
    } else if (Array.isArray(valA) && Array.isArray(valB)) {
      // Both arrays: concatenate into a new array.
      result[key] = [...valA, ...valB];
    } else if (isPlainObject(valA) && isPlainObject(valB)) {
      // Both plain objects: recurse.
      result[key] = deepMerge(valA, valB);
    } else {
      // All other cases: objB wins.
      result[key] = deepCopy(valB);
    }
  }

  return result;
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function deepCopy(value) {
  if (Array.isArray(value)) {
    return value.map(deepCopy);
  }
  if (isPlainObject(value)) {
    const copy = {};
    for (const key of Object.keys(value)) {
      copy[key] = deepCopy(value[key]);
    }
    return copy;
  }
  return value;
}

// Example usage:
// deepMerge({ a: 1 }, { b: 2 }); // => { a: 1, b: 2 }
// deepMerge({ a: 1 }, { a: 2 }); // => { a: 2 }
// deepMerge({ a: 1, b: [2] }, { b: [3, 4] }); // => { a: 1, b: [2, 3, 4] }
