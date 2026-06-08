class StoreData {
  constructor() {
    /**
     * Use a Map instead of a plain object because:
     * 1. Map supports any type of key.
     * 2. Map has clean APIs like has(), get(), set().
     * 3. It avoids edge cases with object prototype keys like "__proto__".
     */
    this.store = new Map();

    /**
     * listeners stores eventName -> list of callbacks.
     *
     * Example:
     * {
     *   "change:name": [callback1, callback2],
     *   "age": [callback3]
     * }
     */
    this.listeners = new Map();
  }

  /**
   * Add or update a key-value pair.
   *
   * Interview explanation:
   * - If the key is new, we simply store it.
   * - If the key already exists and the value changes,
   *   we notify subscribers.
   */
  add(key, value) {
    const hasOldValue = this.store.has(key);
    const oldValue = this.store.get(key);

    /**
     * Update the actual data first.
     *
     * This means if a listener calls store.get(key),
     * it will see the latest value.
     */
    this.store.set(key, value);

    /**
     * Only emit events when this is an update, not the first insert.
     *
     * Example:
     * store.add("name", "joe");  // no event yet
     * store.add("name", "emma"); // this is a change
     */
    if (hasOldValue && oldValue !== value) {
      /**
       * Support direct key subscription:
       *
       * store.on("age", callback)
       */
      this.emit(key, oldValue, value, key);

      /**
       * Support change-style subscription:
       *
       * store.on("change:age", callback)
       */
      this.emit(`change:${key}`, oldValue, value, key);
    }
  }

  /**
   * Check whether a key exists in the store.
   *
   * Time complexity: O(1)
   */
  has(key) {
    return this.store.has(key);
  }

  /**
   * Optional helper to read a value by key.
   *
   * Time complexity: O(1)
   */
  get(key) {
    return this.store.get(key);
  }

  /**
   * Register a callback for a specific event.
   *
   * Example:
   * store.on("change:name", callback)
   *
   * Interview explanation:
   * - Multiple callbacks can listen to the same event.
   * - We store all callbacks in an array.
   * - Returning an unsubscribe function is useful for cleanup.
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    this.listeners.get(eventName).push(callback);

    /**
     * Return an unsubscribe function.
     *
     * This is useful in real apps to avoid memory leaks,
     * especially in UI frameworks like React.
     */
    return () => {
      const callbacks = this.listeners.get(eventName) ?? [];

      const nextCallbacks = callbacks.filter((cb) => cb !== callback);

      if (nextCallbacks.length === 0) {
        this.listeners.delete(eventName);
      } else {
        this.listeners.set(eventName, nextCallbacks);
      }
    };
  }

  /**
   * Trigger all callbacks registered for one event.
   *
   * Example:
   * emit("change:name", "emma", "john", "name")
   *
   * Each callback receives:
   * - oldValue
   * - newValue
   * - key
   */
  emit(eventName, oldValue, newValue, key) {
    const callbacks = this.listeners.get(eventName) ?? [];

    for (const callback of callbacks) {
      callback(oldValue, newValue, key);
    }
  }
}

/**
let store = new StoreData();

store.add('name', 'joe');
store.add('age', 30);

console.log(store.has('age'));    // true
console.log(store.has('animal')); // false

store.add('name', 'emma');

store.on('change:name', (old_val, new_val, key) => {
  console.log(`old ${key}: ${old_val}, new ${key}: ${new_val}`);
});

store.add('name', 'john');
// old name: emma, new name: john

store.on('age', (old_val, new_val, key) => {
  console.log(`old ${key}: ${old_val}, new ${key}: ${new_val}`);
});

store.add('age', 26);
// old age: 30, new age: 26

store.on('change:age', (old_val, new_val, key) => {
  console.log(`${old_val > new_val ? 'older now' : ''}`);
});

store.add('age', 28);
// old age: 26, new age: 28
// ""

store.add('age', 45);
// old age: 28, new age: 45
// ""
 */