/**
 * @template T, U
 * @param {(previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U} callbackFn
 * @param {U} [initialValue]
 * @return {U}
 */
Array.prototype.myReduce = function (callbackFn, initialValue) {
  if (typeof callbackFn !== 'function') {
    throw new TypeError(`${callbackFn} is not a function`);
  }

  const hasOwn = Object.prototype.hasOwnProperty;

  let accumulator = initialValue;
  let startIndex = 0;

  if (initialValue === undefined) {
    // Native reduce uses the first present element, not simply index 0.
    while (startIndex < this.length && !hasOwn.call(this, startIndex)) {
      startIndex++;
    }

    if (startIndex >= this.length) {
      throw new TypeError('Reduce of empty array with no initial value');
    }

    accumulator = this[startIndex];
    startIndex++;
  }

  for (let i = startIndex; i < this.length; i++) {
    // Sparse holes are skipped by native reduce.
    if (!hasOwn.call(this, i)) {
      continue;
    }

    accumulator = callbackFn(accumulator, this[i], i, this);
  }

  return accumulator;
};