/**
 * Returns true when the input contains valid JavaScript syntax.
 *
 * `new Function()` compiles the source code but does not execute it.
 * A SyntaxError is thrown when the source is invalid.
 *
 * This validates regular JavaScript "script" syntax.
 * It does not support module-only syntax such as:
 *
 *   import value from "./file.js";
 *   export default value;
 */
function isValidJavaScript(code) {
  if (typeof code !== "string") {
    return false;
  }

  try {
    // The function body is parsed here, but it is not invoked.
    new Function(code);
    return true;
  } catch (error) {
    // Only syntax errors mean the JavaScript is invalid.
    if (error instanceof SyntaxError) {
      return false;
    }

    // Defensive fallback for unexpected errors.
    return false;
  }
}

// Input: "var x = 5;"
// Output: true

// Input: "var x = ;"
// Output: false