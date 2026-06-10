
/**
 * Text Justification
 *
 * Problem:
 * Given text (string of words) and line width L, format the text such that:
 * - Each line has exactly L characters (padded with spaces)
 * - Text is fully justified (both left and right aligned)
 * - Words are separated by at least one space
 * - Words should not be split across lines
 * - Last line is left-justified (extra spaces go at the end)
 *
 * Example:
 * Input: "Coursera provides universal..." with L=20
 * Output:
 *   "Coursera    provides" (10 spaces distributed)
 *   "universal  access to" (2 spaces in gaps)
 *   "the   world's   best" (3 and 3 spaces in gaps)
 *   "education," (left-justified, pad right with spaces)
 *
 * Approach:
 * 1. Split text into words
 * 2. Greedily pack words into lines (fit as many words as possible per line)
 * 3. For each line (except last):
 *    - Calculate total spaces available
 *    - Distribute spaces evenly across word gaps
 *    - Extra spaces go from left to right
 * 4. Last line: simple left-justify (one space between words, pad right)
 *
 * Algorithm Detail:
 * - Track which words belong to each line
 * - For justified lines: distribute (L - totalWordLength) spaces across (wordCount - 1) gaps
 *   - Base spaces per gap: spacePerGap = totalSpaces / numGaps
 *   - Extra spaces to distribute: spaceRemain = totalSpaces % numGaps
 *   - First spaceRemain gaps get +1 space
 * - Build output by interleaving words and space counts
 *
 * Time Complexity:
 * - O(N) where N = length of input text
 * - One pass to split words, one pass to group into lines, one pass to format
 *
 * Space Complexity:
 * - O(M) where M = number of words
 * - Stores words array and line groupings
 *
 * Interview Tips:
 * - Clarify edge cases: single word lines, exactly fitting line, last line handling
 * - Explain greedy line packing: fit words left-to-right, start new line when full
 * - Walk through space distribution: show how to evenly spread with remainder handling
 * - Discuss indexing: be careful with gap count (numGaps = wordCount - 1)
 * - Trace example: show "Coursera provides" gets 10 spaces in middle
 * - Single word line: no gaps (numGaps=0), all spaces go to the right
 * - Performance: linear time is optimal, can't do better
 */

// Helper: Generate array of space counts for each gap between words
// Distributes spaceRemain extra spaces to the first gaps
// Example: space=2, gap=3, spaceRemain=1 → [3, 2, 2] (first gap gets extra space)
function generateFinalSpace(space, gap, spaceRemain) {
  const arr = [];
  for (let i = 0; i < gap; i++) {
    if (spaceRemain > 0) {
      arr[i] = space + 1;  // Add extra space to this gap
      spaceRemain -= 1;
    } else {
      arr[i] = space;      // Standard space count
    }
  }
  return arr;
}

// Helper: Generate string of N spaces
function generateSpace(count) {
  let space = '';
  for (let i = 0; i < count; i++) {
    space += ' ';
  }
  return space;
}

// Helper: Justify a single line to exactly L characters
// Takes array of words and distributes spaces evenly
function adjustText(arr, L) {
  // Calculate total length of all words
  let count = 0;
  arr.map((item) => {
    count += item.length;
  });
  
  // Total spaces available = L - total word length
  const spaceLeft = L - count;
  // Number of gaps between words
  const gap = (arr.length - 1);
  
  // Distribute spaces: base amount per gap + remainder to first gaps
  const space = Math.floor(spaceLeft / gap);           // Base spaces per gap
  const spaceRemain = spaceLeft - space * gap;          // Extra spaces for first gaps
  const spaceCount = generateFinalSpace(space, gap, spaceRemain); // Array of space counts per gap

  // Build result by alternating words and space counts
  const result = [];
  arr.map((item, i) => {
    result.push(item);
    if (spaceCount[i]) {
      result.push(spaceCount[i]);  // Space count (not spaces themselves yet)
    }
  });
  
  // Convert space counts to actual space strings
  let str = '';
  result.map((item, i) => {
    if (i % 2 !== 0) {
      str += generateSpace(item);  // Odd indices are space counts
    } else {
      str += item;                  // Even indices are words
    }
  });
  return str;
}

/**
 * Main function: Justify text to line width L
 * 
 * @param {string} input - Text to justify
 * @param {number} L - Maximum line width
 */
function textJustify(input, L) {
  // Split input into words
  const arr = input.split(' ');
  const line = {};
  let currCount = L;      // Remaining space in current line
  let currLine = 1;       // Current line number
  line[`${currLine}`] = [];

  // Greedy packing: fit as many words as possible per line
  for (let i = 0; i < arr.length; i++) {
    let str = arr[i];
    
    // Check if word fits in current line (including minimum 1 space separator)
    if (str.length <= currCount) {
      line[`${currLine}`].push(str);
      currCount = currCount - (str.length + 1);  // Account for space after word
    } else {
      // Word doesn't fit, start new line
      currLine = currLine + 1;
      line[`${currLine}`] = [str];
      currCount = L - (str.length + 1);  // Reset line space, account for this word
    }
  }

  // Format and output each line
  Object.keys(line).map((key) => {
    if (key === `${currLine}`) {
      // Last line: left-justify (simple space separation, pad right)
      console.log(line[key].join(' '));
    } else {
      // Non-last lines: fully justify with even space distribution
      console.log(adjustText(line[key], L));
    }
  });
}

// Test case
const input = "Coursera provides universal access to the world's best education, partnering with top universities and organizations to offer courses online.";
const L = 20;
console.log(textJustify(input, L));
// online.
