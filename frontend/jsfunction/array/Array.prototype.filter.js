/**
 * @template T
 * @param {(value: T, index: number, array: Array<T>) => boolean} callbackFn
 * @param {unknown} [thisArg]
 * @returns {Array<T>}
 */
Array.prototype.myFilter = function (callbackFn, thisArg) {
    const result = [];
    for (let i = 0; i < this.length; i++) {
        // skip empty slot in sparse array
        // if (!(i in this)) {
        //     continue;
        // }
        if (callbackFn.call(thisArg, this[i], i, this) {
            result.push(this[i]);
        }
    }
    return result;
};