function isAnagram(s, t) {
  if (s.length !== t.length) {
    return false;
  }

  const count = new Map();

  for (const char of s) {
    count.set(char, (count.get(char) || 0) + 1);
  }

  for (const char of t) {
    if (!count.has(char)) {
      return false;
    }

    count.set(char, count.get(char) - 1);

    if (count.get(char) < 0) {
      return false;
    }
  }

  return true;
}

isAnagram("anagram", "nagaram");
// true

isAnagram("rat", "car");
// false

// Time complexity: O(n) - single pass through both strings
// Space complexity: O(n) - hash map to store character counts