/**
 * Return the declared parameter count of a function.
 *
 * @param {Function} fn
 * @returns {number}
 */
export default function functionLength(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('Expected a function');
  }

  return fn.length;
}

// Examples:
// functionLength(function(a, b, c) {}); // 3
// functionLength((a, b = 1, c) => {}); // 1
