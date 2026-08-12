// Example:
// Input: s = 'abcabcbb'
// Output: 3 ('abc')
//
// Steps:
// 1. Use a sliding window to represent the current substring.
// 2. Track the characters in the window with a Set.
// 3. Move `right` through the string to expand the window.
// 4. When a duplicate appears, move `left` forward and remove characters
//    until the window contains unique characters again.
// 5. Calculate the current window length as `right - left + 1`.
// 6. Keep the largest window length found.
function lengthOfLongestSubstring(s) {
  const seen = new Set();

  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }

    // Add current character to the window.
    seen.add(s[right]);

    // Current window length = right - left + 1
    maxLength = Math.max(
      maxLength,
      right - left + 1
    );
  }

  return maxLength;
}