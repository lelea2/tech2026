/**
 * @return {Array<number>}
 */
Array.prototype.square = function () {
  const result = new Array(this.length);

  for (let i = 0; i < this.length; i++) {
    if (Object.prototype.hasOwnProperty.call(this, i)) {
      result[i] = this[i] * this[i];
    }
  }

  return result;
};