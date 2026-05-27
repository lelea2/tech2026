/**
 * Implement a function deepMap(value, fn) to return a new value containing 
 * the results of calling a provided function on every non-Array 
 * and non-Object element in the value input, 
 * including elements within nested Arrays and Objects. 
 * The function fn is called with a single argument,
 * the element that is being mapped/transformed.
 */
/**
 * @param {unknown} value
 * @param {(value: unknown) => unknown} fn
 * @returns {unknown}
 */
/**
 * Deeply map all primitive/non-object values.
 *
 * Data structure:
 * - Recursive traversal of nested Arrays and Objects
 *
 * Core idea:
 * - If value is Array:
 *   recursively map each element
 *
 * - If value is plain Object:
 *   recursively map each property
 *
 * - Otherwise:
 *   apply fn(value)
 *
 * @param {*} value
 * @param {Function} fn
 * @returns {*}
 */
/**
 * Deeply map all primitive/non-object values.
 *
 * @param {*} value
 * @param {Function} fn
 * @returns {*}
 */
export default function deepMap(value, fn) {
  return helper(value, fn, null);
}

/**
 * Check whether value is a plain object.
 *
 * @param {*} value
 * @returns {boolean}
 */

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    value.constructor === Object
  );
}

function helper(value, fn, parent) {
  // Handle arrays.
  if (Array.isArray(value)) {
    return value.map((item) =>
      helper(item, fn, value),
    );
  }

  // SHould traverse plan object only
  if (isPlainObject(value)) {
    const result = {};

    for (const key of Object.keys(value)) {
      result[key] = helper(
        value[key],
        fn,
        value,
      );
    }

    return result;
  }

  // Call fn with parent as `this`.
  return fn.call(parent, value);
}

/**
const double = (x) => x * 2;

deepMap(2, double); // 4
deepMap([1, 2, 3], double); // [2, 4, 6]
deepMap({ a: 1, b: 2, c: 3 }, double); // { a: 2, b: 4, c: 6 }
deepMap(
  {
    foo: 1,
    bar: [2, 3, 4],
    qux: { a: 5, b: 6 },
  },
  double,
); // => { foo: 2, bar: [4, 6, 8], qux: { a: 10, b: 12 } }
 */