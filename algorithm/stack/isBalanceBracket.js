// O(n) time
// O(n) space

/**
 * @param {string} str
 * @return {boolean}
 */
export default function isBalancedBrackets(str) {
  const openingBrackets = '([{';
  const closingBrackets = ')]}';
  const matchingBrackets = {
    ')': '(',
    ']': '[',
    '}': '{'
  };
  // create a stack and pop out when we see matching open and close bracket
  const stack = [];
  for (const char of str) {
    if (openingBrackets.includes(char)) {
      stack.push(char);
    } else if (closingBrackets.includes(char)) {
      if (stack.length === 0) {
        return false;
      } 
      if (stack[stack.length - 1] === matchingBrackets[char]) {
        stack.pop();
      } else {
        return false;
      }
    }
  }
  return stack.length === 0;
}