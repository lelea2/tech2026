/**
 * Create a counter function.
 *
 * First call returns initialValue (or 0 when omitted),
 * each subsequent call returns previous value + 1.
 *
 * @param {number} [initialValue=0]
 * @returns {() => number}
 */
export default function makeCounter(initialValue = 0) {
  let current = initialValue;

  return function() {
    const valueToReturn = current;
    current += 1;
    return valueToReturn;
  };
}

// Example:
// const counterA = makeCounter();
// counterA(); // 0
// counterA(); // 1
//
// const counterB = makeCounter(5);
// counterB(); // 5
// counterB(); // 6
