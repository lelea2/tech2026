// Merge Sorted Array (in-place).
// `nums1` has length m + n, with the last n slots reserved for merge.
//
// Example:
// Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
// Output: nums1 = [1,2,2,3,5,6]
function merge(nums1, m, nums2, n) {
  let i = m - 1;       // last valid element in nums1
  let j = n - 1;       // last element in nums2
  let k = m + n - 1;   // last position in nums1

  while (j >= 0) {
    // Pick the larger value and place it at the end
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k] = nums1[i];
      i--;
    } else {
      nums1[k] = nums2[j];
      j--;
    }

    k--;
  }
}