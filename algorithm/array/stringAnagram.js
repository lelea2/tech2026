/**
 * Interview thought process:
 *
 * Anagrams must:
 * 1. Have the same length.
 * 2. Contain the same characters with the same frequency.
 */
export default function isAnagram(str1, str2) {
  // Quick fail: different lengths cannot be anagrams.
  if (str1.length !== str2.length) {
    return false;
  }

  // Count character frequencies in str1.
  const frequencyMap = new Map();

  for (const char of str1) {
    frequencyMap.set(char, (frequencyMap.get(char) ?? 0) + 1);
  }

  for (const char of str2) {
    const count = frequencyMap.get(char);

    if (count === undefined) {
      return false;
    }

    if (count === 1) {
      frequencyMap.delete(char);
    } else {
      frequencyMap.set(char, count - 1);
    }
  }

  // All counts should be consumed.
  return frequencyMap.size === 0;
}


/*** Approach #2: frequency array */
export default function isAnagram(str1, str2) {
  /**
   * Optimization:
   * Since strings only contain lowercase English letters,
   * we do not need a Map.
   *
   * We can use an array of size 26:
   * index 0 = 'a'
   * index 1 = 'b'
   * ...
   * index 25 = 'z'
   */

  if (str1.length !== str2.length) {
    return false;
  }

  const counts = new Array(26).fill(0);

  for (let i = 0; i < str1.length; i++) {
    const charFromStr1 = str1.charCodeAt(i) - 97;
    const charFromStr2 = str2.charCodeAt(i) - 97;

    counts[charFromStr1]++;
    counts[charFromStr2]--;
  }

  /**
   * If both strings have the same character frequencies,
   * every count should return back to 0.
   */
  for (const count of counts) {
    if (count !== 0) {
      return false;
    }
  }

  return true;
}