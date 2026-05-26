/**
 * @param {Function} fn
 * @returns {Function}
 */
export default function curry(fn) {
  function buildCurried(collectedArgs, boundThis) {
    return function curried(...args) {
      const nextThis = boundThis === undefined ? this : boundThis;

      // For zero-arity functions, invoke immediately
      if (fn.length === 0) {
        return fn.apply(nextThis, collectedArgs.concat(args));
      }

      // If no args provided, return a new curried function
      if (args.length === 0) {
        return buildCurried(collectedArgs, nextThis);
      }

      // Collect the new arguments
      const nextArgs = collectedArgs.concat(args);

      // If we have enough arguments, invoke fn
      if (nextArgs.length >= fn.length) {
        return fn.apply(nextThis, nextArgs);
      }

      // Otherwise, return a new curried function
      return buildCurried(nextArgs, nextThis);
    };
  }

  return buildCurried([], undefined);
}

// Example usage:
// function addTwo(a, b) {
//   return a + b;
// }
// const curriedAddTwo = curry(addTwo);
// curriedAddTwo(3)(4); // 7
// curriedAddTwo(3, 4); // 7
//
// function multiplyThree(a, b, c) {
//   return a * b * c;
// }
// const curriedMultiplyThree = curry(multiplyThree);
// curriedMultiplyThree(4)(5)(6); // 120
// curriedMultiplyThree(4)(5, 6); // 120
// curriedMultiplyThree(4, 5)(6); // 120
// curriedMultiplyThree(4, 5, 6); // 120
