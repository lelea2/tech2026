// O(n) time
// O(1) space
// Test cases:
// isStringPalindrome('A man, a plan, a canal: Panama') -> true
// isStringPalindrome('race a car') -> false
// isStringPalindrome('') -> true
// isStringPalindrome('0P') -> false
/**
 * @param {string} str
 * @return {boolean}
 */
export default function isStringPalindrome(str) {
  let leftIdx = 0;
  const result = str
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  let rightIdx = result.length - 1;
  while (leftIdx < rightIdx) {
    if (result[leftIdx] !== result[rightIdx]) {
      return false;
    }
    leftIdx++;
    rightIdx--;
  }
  return true;
}
