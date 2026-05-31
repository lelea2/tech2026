/**
 * You are given an array nums of length n, 
 where each element represents an object colored either red, white, or blue. 
 The integers 0, 1, and 2 are used to represent red, white, and blue, respectively.
* Sort the array in place so that all objects of the same color are grouped together, 
arranged in the order: red (0), white (1), and blue (2).
* You must solve this problem without using any library sort function.
 */
export default function sortColors(colors) {
  // Dutch National Flag Algorithm
  // low  -> boundary for next 0
  // mid  -> current element being processed
  // high -> boundary for next 2
  let low = 0;
  let mid = 0;
  let high = colors.length - 1;
    
  // Invariant:
  // [0 .. low - 1]      => all 0s
  // [low .. mid - 1]    => all 1s
  // [mid .. high]       => unknown
  // [high + 1 .. end]   => all 2s
  while (mid <= high) {
    if (colors[mid] === 0) {
      // Current value belongs in the left section.
      // Swap current element with the next position
      // reserved for 0s.
      [colors[low], colors[mid]] = [colors[mid], colors[low]];
      // Both pointers move because:
      // - the 0 is now correctly placed
      // - everything before mid is processed
      low++;
      mid++;
    } else if (colors[mid] === 1) {
      // 1 belongs in the middle section.
      // Nothing to swap.
      mid++;
    } else { // colors[mid] === 2
      // Move 2 into the right section.
      [colors[mid], colors[high]] = [colors[high], colors[mid]];
      // Shrink the right boundary.
      high--;
      // IMPORTANT:
      // Do NOT increment mid here.
      //
      // The element swapped from colors[high]
      // has not been examined yet.
      //
      // Example:
      // [1,2,0]
      //      ^
      // swap 2 with 0 => [1,0,2]
      // Need to process the new 0 at mid.
    }
  }
  return colors;
}
