"""
3Sum lesson: find all unique triplets that sum to zero.

Problem statement:
Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]]
with i, j, k distinct and nums[i] + nums[j] + nums[k] == 0.

Why two pointers works:
1) Sort the array so duplicates become adjacent and pointer movement is meaningful.
2) Fix one value at index i.
3) Search pairs in the subarray i+1..end using left/right pointers.
4) Move pointers based on the sum:
   - sum < 0: move left rightward to increase sum.
   - sum > 0: move right leftward to decrease sum.
   - sum == 0: record triplet and skip duplicates on both sides.

Complexity:
- Time: O(n^2)
- Extra space: O(1) excluding output (sorting uses implementation-dependent space)

Mini quiz (answers at bottom):
Q1: Why must we skip repeated nums[i] values?
Q2: After finding a valid triplet, why skip duplicate left/right values?
Q3: Why can we stop early when sorted_nums[i] > 0?
"""


def three_sum(nums):
	"""Return all unique triplets [a, b, c] from nums such that a + b + c == 0."""
	sorted_nums = sorted(nums)
	n = len(sorted_nums)
	triplets = []

	for i in range(n - 2):
		current = sorted_nums[i]

		# Early stop: once the fixed number is positive, all following numbers are >= current.
		if current > 0:
			break

		# Skip duplicate anchors to avoid duplicate triplets.
		if i > 0 and current == sorted_nums[i - 1]:
			continue

		left, right = i + 1, n - 1

		while left < right:
			total = current + sorted_nums[left] + sorted_nums[right]

			if total < 0:
				left += 1
			elif total > 0:
				right -= 1
			else:
				triplets.append([current, sorted_nums[left], sorted_nums[right]])
				left += 1
				right -= 1

				# Skip duplicate pair values after recording a valid triplet.
				while left < right and sorted_nums[left] == sorted_nums[left - 1]:
					left += 1
				while left < right and sorted_nums[right] == sorted_nums[right + 1]:
					right -= 1

	return triplets


class Solution:
	def threeSum(self, nums):
		return three_sum(nums)


if __name__ == "__main__":
	# Practice checks
	print(three_sum([-1, 0, 1, 2, -1, -4]))  # [[-1, -1, 2], [-1, 0, 1]]
	print(three_sum([0, 1, 1]))              # []
	print(three_sum([0, 0, 0, 0]))           # [[0, 0, 0]]

	# Mini quiz answers:
	# A1: Repeated anchors would regenerate the same pair search and duplicate triplets.
	# A2: Adjacent duplicates would produce the same triplet values multiple times.
	# A3: If the smallest fixed value is already > 0, any triplet sum must also be > 0.
