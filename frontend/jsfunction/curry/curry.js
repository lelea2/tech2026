/**
 * Interview question: Implement curry()
 *
 * Currying transforms a function that expects multiple arguments into a chain
 * of functions that can receive those arguments over time.
 *
 * Example:
 * add(1, 2, 3)
 * curry(add)(1)(2)(3)
 * curry(add)(1, 2)(3)
 * curry(add)()(1)()(2, 3)
 *
 * The curried function should keep collecting arguments until it has at least
 * `fn.length` arguments, where `fn.length` is the number of declared
 * parameters on the original function.
 *
 * Key ideas:
 * - Store previously collected arguments in a closure.
 * - Return another function when we still need more arguments.
 * - Call the original function once enough arguments have been collected.
 * - Preserve `this` from the first meaningful call, so curried methods can
 *   still access object state.
 *
 * Edge cases handled here:
 * - Empty calls do not execute the original function; they return another
 *   curried function.
 * - Functions with `fn.length === 0` are invoked immediately with whatever
 *   arguments are provided because there is no declared arity to wait for.
 *
 * Time:
 * - Each partial call copies collected arguments, so a call chain costs O(n)
 *   total argument work for n arguments.
 *
 * Space:
 * - O(n) for collected arguments stored in closures.
 *
 * @param {Function} fn
 * @returns {Function}
 */
export default function curry(fn) {
  // Build a new curried function that remembers:
  // - collectedArgs: arguments received so far
  // - boundThis: the `this` value captured from the first useful invocation
  function buildCurried(collectedArgs, boundThis) {
    return function curried(...args) {
      // Capture `this` once. Later chained calls should keep using the same
      // receiver so method currying works predictably.
      const nextThis = boundThis === undefined ? this : boundThis;

      // A zero-arity function has no target argument count, so call it when the
      // wrapper is invoked.
      if (fn.length === 0) {
        return fn.apply(nextThis, collectedArgs.concat(args));
      }

      // Empty calls are allowed and useful in interview test cases:
      // curry(add)()(1)()(2)
      if (args.length === 0) {
        return buildCurried(collectedArgs, nextThis);
      }

      const nextArgs = collectedArgs.concat(args);

      // Once we have enough arguments, execute the original function.
      // Extra arguments are passed through, matching normal JS call behavior.
      if (nextArgs.length >= fn.length) {
        return fn.apply(nextThis, nextArgs);
      }

      // Not enough arguments yet, so return another collector function.
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
