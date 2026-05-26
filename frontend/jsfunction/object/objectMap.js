/**
 * @param {Record<string, unknown>} obj
 * @param {(value: unknown) => unknown} fn
 * @returns {Record<string, unknown>}
 */
export default function objectMap(obj, fn) {
  const result = {};
  Object.keys(obj).map((key) => {
    result[key] = fn.call(obj, obj[key], key, obj);
  });
  return result;
}