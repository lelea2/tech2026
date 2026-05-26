/**
 * @param {Function} fn
 * @returns {Function}
 */
export default function curry(fn) {
  function buildCurried(collectedArgs, boundThis) {
    const curried = function(...args) {
      const nextThis = boundThis === undefined ? this : boundThis;
      return buildCurried(collectedArgs.concat(args), nextThis);
    };

    // When coerced to a primitive, invoke fn with collected args
    curried[Symbol.toPrimitive] = () => {
      return fn.apply(boundThis, collectedArgs);
    };

    // Fallback for valueOf (numeric context)
    curried.valueOf = () => {
      return fn.apply(boundThis, collectedArgs);
    };

    // Fallback for toString (string context)
    curried.toString = () => {
      return String(fn.apply(boundThis, collectedArgs));
    };

    return curried;
  }

  return buildCurried([], undefined);
}

// Example usage:
// function multiply(...numbers) {
//   return numbers.reduce((a, b) => a * b, 1);
// }
// const curriedMultiply = curry(multiply);
// const multiplyByThree = curriedMultiply(3);
// console.log(multiplyByThree); // 3
// console.log(multiplyByThree(4)); // 12
//
// const multiplyByFifteen = multiplyByThree(5);
// console.log(multiplyByFifteen); // 15
// console.log(multiplyByFifteen(2)); // 30
//
// console.log(curriedMultiply(1)(2)(3)(4)); // 24
// console.log(curriedMultiply(1, 2, 3, 4)); // 24
