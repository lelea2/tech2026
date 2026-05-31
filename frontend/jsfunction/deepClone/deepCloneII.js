/**
 * Advanced deep clone:
 * - Handles primitives/functions by returning as-is.
 * - Handles circular references via WeakMap.
 * - Clones common built-ins (Date, RegExp, Map, Set, ArrayBuffer, TypedArrays, DataView, Error).
 * - Preserves prototype, symbol keys, and property descriptors for objects.
 *
 * @template T
 * @param {T} value
 * @param {WeakMap<object, any>} [seen]
 * @returns {T}
 */
export default function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value);
  }

  const tag = Object.prototype.toString.call(value);

  if (tag === '[object Date]') {
    return /** @type {T} */ (new Date(value.getTime()));
  }

  if (tag === '[object RegExp]') {
    const clonedRegExp = new RegExp(value.source, value.flags);
    clonedRegExp.lastIndex = value.lastIndex;
    return /** @type {T} */ (clonedRegExp);
  }

  if (tag === '[object Map]') {
    const clonedMap = new Map();
    seen.set(value, clonedMap);
    for (const [key, val] of value.entries()) {
      clonedMap.set(deepClone(key, seen), deepClone(val, seen));
    }
    return /** @type {T} */ (clonedMap);
  }

  if (tag === '[object Set]') {
    const clonedSet = new Set();
    seen.set(value, clonedSet);
    for (const item of value.values()) {
      clonedSet.add(deepClone(item, seen));
    }
    return /** @type {T} */ (clonedSet);
  }

  if (tag === '[object ArrayBuffer]') {
    return /** @type {T} */ (value.slice(0));
  }

  if (ArrayBuffer.isView(value)) {
    if (tag === '[object DataView]') {
      const bufferClone = deepClone(value.buffer, seen);
      return /** @type {T} */ (
        new DataView(bufferClone, value.byteOffset, value.byteLength)
      );
    }

    // Typed arrays (Int8Array, Uint8Array, Float32Array, etc).
    return /** @type {T} */ (new value.constructor(value));
  }

  if (tag === '[object Error]') {
    const clonedError = new value.constructor(value.message);
    seen.set(value, clonedError);
    copyOwnProperties(value, clonedError, seen);
    return /** @type {T} */ (clonedError);
  }

  // Preserve prototype for plain objects, arrays, and class instances.
  const cloned = Array.isArray(value)
    ? new Array(value.length)
    : Object.create(Object.getPrototypeOf(value));

  seen.set(value, cloned);
  copyOwnProperties(value, cloned, seen);

  return /** @type {T} */ (cloned);
}

/**
 * Copy all own properties (including non-enumerable and symbol keys)
 * while preserving property descriptors.
 *
 * @param {object} source
 * @param {object} target
 * @param {WeakMap<object, any>} seen
 */
function copyOwnProperties(source, target, seen) {
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (!descriptor) {
      continue;
    }

    if ('value' in descriptor) {
      descriptor.value = deepClone(descriptor.value, seen);
    }

    Object.defineProperty(target, key, descriptor);
  }
}
