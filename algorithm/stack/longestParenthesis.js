function longestValidParentheses(s) {
  let maxLen = 0;
  const stack = [-1];

  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") { // this should me format otherwise, need to check for match
      stack.push(i);
    } else {
      stack.pop();

      if (stack.length === 0) {
        // This ')' cannot be matched.
        // It becomes the new boundary.
        stack.push(i);
      } else {
        maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
      }
    }
  }

  return maxLen;
}

// Time complexity: O(n) - we traverse the string once
// Space complexity: O(n) - in the worst case, we may need to store all indices in the stack

// Example usage:
const input = "(()())";
console.log(longestValidParentheses(input)); // Output: 6

// Give explanation in visualization:
// 1. Initialize maxLen = 0 and stack = [-1].
// 2. Iterate through the string:
//    - For '(', push its index onto the stack.
//    - For ')', pop from the stack. If the stack is empty, push the current index as a new boundary. Otherwise, calculate the length of the valid substring and update maxLen if it's larger.
// 3. Return maxLen after processing the entire string.