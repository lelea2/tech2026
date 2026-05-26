/**
 * Creates a counter object with encapsulated state.
 *
 * @param {number} [initialValue=0]
 * @returns {{
 *   get: () => number,
 *   increment: () => number,
 *   decrement: () => number,
 *   reset: () => number
 * }}
 */
export default function makeCounter(initialValue = 0) {
  // Internal mutable state
  let currentValue = initialValue;

  return {
    /**
     * Returns current counter value.
     */
    get() {
      return currentValue;
    },

    /**
     * Increments counter and returns updated value.
     */
    increment() {
      currentValue += 1;
      return currentValue;
    },

    /**
     * Decrements counter and returns updated value.
     */
    decrement() {
      currentValue -= 1;
      return currentValue;
    },

    /**
     * Resets counter back to initial value.
     */
    reset() {
      currentValue = initialValue;
      return currentValue;
    },
  };
}

/**
 * 
const counter = makeCounter();
counter.get(); // 0
counter.increment(); // 1
counter.increment(); // 2
counter.get(); // 2
counter.reset(); // 0
counter.decrement(); // -1
-------
const counter = makeCounter(5);
counter.get(); // 5
counter.decrement(); // 4
counter.decrement(); // 3
counter.get(); // 3
counter.reset(); // 5
counter.increment(); // 6
 */