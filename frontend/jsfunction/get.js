/**
 * Interview-style explanation:
 *
 * Problem:
 * - Safely read a deeply nested value from an object using a path.
 * - Path can be a dot string ("a.0.b") or an array (["a", 0, "b"]).
 * - If traversal fails or final value is undefined, return defaultValue (if provided).
 *
 * Plan:
 * 1. Normalize path into an array of keys.
 * 2. Walk the object one key at a time.
 * 3. If current value is null/undefined or not traversable before path ends,
 *    return defaultValue/undefined.
 * 4. After traversal, if resolved value is undefined, return defaultValue/undefined;
 *    otherwise return the resolved value.
 *
 * Why this works:
 * - The traversal simulates optional chaining across an arbitrary path length.
 * - Early exits prevent runtime errors from accessing properties on invalid values.
 * - The final undefined check matches Lodash-style get fallback behavior.
 *
 * Complexity:
 * - Time: O(p), where p is number of path segments.
 * - Space: O(p) for normalized keys when path is a string.
 *
 * @param {object} object
 * @param {string | Array<string | number>} path
 * @param {*} [defaultValue]
 * @returns {*}
 */
export default function get(object, path, defaultValue) {
  const hasDefaultValue = arguments.length >= 3;
  const keys = Array.isArray(path) ? path : String(path).split('.');

  let current = object;

  for (const key of keys) {
    if (current == null) {
      return hasDefaultValue ? defaultValue : undefined;
    }

    const currentType = typeof current;
    if (currentType !== 'object' && currentType !== 'function') {
      return hasDefaultValue ? defaultValue : undefined;
    }

    current = current[key];
  }

  if (current === undefined) {
    return hasDefaultValue ? defaultValue : undefined;
  }

  return current;
}
