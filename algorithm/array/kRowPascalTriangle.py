def get_row(k):
	"""Return the k-th (0-indexed) row of Pascal's triangle using O(k) space."""
	if k < 0:
		return []

	row = [0] * (k + 1) # fill array length k+1 with zeros
	row[0] = 1

	# Build each row in place from right to left so previous values are preserved.
	for r in range(1, k + 1):
		row[r] = 1
		for c in range(r - 1, 0, -1):
			row[c] = row[c] + row[c - 1]

	return row


if __name__ == "__main__":
	print(get_row(3))  # [1, 3, 3, 1]
