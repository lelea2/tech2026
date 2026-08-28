function isValidJS(code) {
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];

    // Skip strings
    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      i++;

      while (i < code.length && code[i] !== quote) {
        if (code[i] === "\\") i++; // skip escaped char
        i++;
      }

      if (i >= code.length) return false;
      continue;
    }

    // Skip // comments
    if (ch === "/" && code[i + 1] === "/") {
      while (i < code.length && code[i] !== "\n") i++;
      continue;
    }

    // Skip /* */ comments
    if (ch === "/" && code[i + 1] === "*") {
      i += 2;

      while (
        i < code.length - 1 &&
        !(code[i] === "*" && code[i + 1] === "/")
      ) {
        i++;
      }

      if (i >= code.length - 1) return false;
      i++; // skip /
      continue;
    }

    if ("([{".includes(ch)) {
      stack.push(ch);
    } else if (")]}".includes(ch)) {
      if (stack.pop() !== pairs[ch]) return false;
    }
  }

  return stack.length === 0;
}

// Time complexity: O(n) - single pass through the code string
// Space complexity: O(n) - in the worst case, we may need to store all opening brackets in the stack

// Example usage:
console.log(isValidJS("function test() { return [1, 2, 3]; }")); // true
console.log(isValidJS("function test() { return [1, 2, 3; }")); // false

// short version answer could use Function
function isValidJavaScript(code) {
  try {
    new Function(code);
    return true;
  } catch (err) {
    return false;
  }
}