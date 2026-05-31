/**
 * @param {Function} fn
 * @returns {Function}
 */
export default function curry(fn) {
  function buildCurried(collectedArgs, boundThis) {
    return function curried(...args) {
      const nextThis = boundThis === undefined ? this : boundThis;

      if (fn.length === 0) {
        return fn.apply(nextThis, collectedArgs.concat(args));
      }

      if (args.length === 0) {
        return buildCurried(collectedArgs, nextThis);
      }

      const nextArgs = collectedArgs.concat(args);

      if (nextArgs.length >= fn.length) {
        return fn.apply(nextThis, nextArgs);
      }

      return buildCurried(nextArgs, nextThis);
    };
  }

  return buildCurried([], undefined);
}

// Example usage:
// function add(a, b) {
// 	return a + b;
// }
//
// const curriedAdd = curry(add);
// curriedAdd(3)(4); // 7
// curriedAdd()(3)()(4); // 7
//
// function multiplyThreeNumbers(a, b, c) {
// 	return a * b * c;
// }
//
// const curriedMultiplyThreeNumbers = curry(multiplyThreeNumbers);
// curriedMultiplyThreeNumbers(4)(5)(6); // 120
// curriedMultiplyThreeNumbers()(4)()(5)(6); // 120
