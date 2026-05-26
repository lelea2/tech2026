"""
Given a list of unique words, return all index pairs [i, j] such that
words[i] + words[j] is a palindrome.

Approach:
- Build a map from word -> index for O(1) lookups.
- For each word, handle 3 matching patterns:
  1) blank string pairs with every palindrome word
  2) full reverse word exists
  3) partial split cases where leftover side is palindrome

Time:  O(N * M^2)
Space: O(N)
"""


def palindrome_pairs(words):
	wmap = {word: idx for idx, word in enumerate(words)}
	pairs = set()

	for i, word in enumerate(words):
		# Blank string can pair on either side with any palindrome word.
		if word == "":
			for j, other in enumerate(words):
				if j != i and is_pal(other):
					pairs.add((i, j))
					pairs.add((j, i))
			continue

		backward = word[::-1]

		# Full reverse match.
		j = wmap.get(backward)
		if j is not None and j != i:
			pairs.add((i, j))

		# Partial matches.
		for split in range(1, len(backward)):
			# left part palindrome => word + match(right part)
			if is_pal(backward, 0, split - 1):
				j = wmap.get(backward[split:])
				if j is not None and j != i:
					pairs.add((i, j))

			# right part palindrome => match(left part) + word
			if is_pal(backward, split, len(backward) - 1):
				j = wmap.get(backward[:split])
				if j is not None and j != i:
					pairs.add((j, i))

	return [list(pair) for pair in pairs]


def is_pal(word, left=0, right=None):
	if right is None:
		right = len(word) - 1

	while left < right:
		if word[left] != word[right]:
			return False
		left += 1
		right -= 1

	return True


if __name__ == "__main__":
	print(palindrome_pairs(["abcd", "dcba", "lls", "s", "sssll"]))
