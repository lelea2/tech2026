// Minimum Number of Moves to Make Palindrome
// 2pointers + greedy algorithm
export default function minimumMovesToMakePalindrome(s) {
  // Strings are immutable in JavaScript.
  // Convert to array so we can perform adjacent swaps.
  const chars = s.split("");

  let left = 0;
  let right = chars.length - 1;
  let moves = 0;

  // Build the palindrome from the outside inward.
  while (left < right) {
    // Try to find a matching character for chars[left]
    // starting from the right side.
    let match = right;
    while (
      match > left && chars[match] !== chars[left]
    ) {
      match--;
    }

    if (match === left) {
      /**
       * We searched the entire right side and found no matching
       * character for chars[left].
       *
       * Since the string is guaranteed to be convertible into
       * a palindrome, this character must be the odd-frequency
       * character that belongs in the center.
       *
       * Move it one step toward the center.
       */
      [chars[left], chars[left + 1]] = [chars[left + 1], chars[left]];
      moves++;

      /**
       * Important:
       * Do NOT move left/right pointers yet.
       *
       * We still need to find the matching pair after
       * shifting this unique character closer to center.
       */
    } else {
      /**
       * Any valid palindrome must pair chars[left]
       * with one of its matching characters.
       *
       * Choosing the rightmost match minimizes the number
       * of adjacent swaps needed to place it at `right`.
       */
      while (match < right) {
        // Bubble the matching character
        // toward its final position.
        [chars[match], chars[match + 1]] = [chars[match + 1], chars[match]];
        match++;
        moves++;
      }
      /**
       * At this point:
       *
       * chars[left] === chars[right]
       *
       * This outer pair is fixed forever.
       */
      left++;
      right--;
    }
  }

  return moves;
}