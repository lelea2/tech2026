/**
 * Stack Data Structure (LIFO - Last In, First Out)
 *
 * Operations:
 * - push(item): Add item to top of stack
 * - pop(): Remove and return top item
 * - peek(): Return top item without removing it
 * - isEmpty(): Check whether stack is empty
 * - length(): Return number of items in stack
 *
 * Time Complexity:
 * - push  -> O(1)
 * - pop   -> O(1)
 * - peek  -> O(1)
 * - isEmpty -> O(1)
 * - length -> O(1)
 */

class Stack {
  constructor() {
    // Internal array used to store stack items
    this.items = [];
  }

  /**
   * Push a new item onto the stack
   * @param {*} item - Value to add
   * @returns {number} New stack length
   */
  push(item) {
    return this.items.push(item);
  }

  /**
   * Remove and return the top item
   * @returns {*} Removed item
   */
  pop() {
    return this.items.pop();
  }

  /**
   * Return the top item without removing it
   * @returns {*} Top item
   */
  peek() {
    return this.items[this.items.length - 1];
  }

  /**
   * Check whether stack is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Return current number of items
   * @returns {number}
   */
  length() {
    return this.items.length;
  }
}

// Example Usage
const stack = new Stack();

console.log(stack.isEmpty()); // true

stack.push(1);
stack.push(2);
stack.push(3);

console.log(stack.peek());   // 3
console.log(stack.length()); // 3

console.log(stack.pop());    // 3
console.log(stack.peek());   // 2