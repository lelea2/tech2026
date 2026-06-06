// Time complexity: O(n), Space complexity: O(n)
export default function countBits(n) {
  const result = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    // i >> 1 removes the least significant bit.
    // i & 1 checks whether the removed bit was 1.
    result[i] = result[i >> 1] + (i & 1);
  }

  return result;
}

/**
 * Count the number of 1's in the binary representation of each number from 0 to n.
 * 
 * Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.
 * 
Input: n = 1
Output: [0,1]
Explanation: The number of set bits in 0 (binary: 0) is 0, and in 1 (binary: 1) is 1.
======
Input: n = 2
Output: [0,1,1]
Explanation: The number of set bits in 0 (binary: 0) is 0, in 1 (binary: 1) is 1, and in 2 (binary: 10) is 1.
====== 
Input: n = 3
Output: [0,1,1,2]
Explanation: The number of set bits in 0 (binary: 0) is 0, in 1 (binary: 1) is 1, in 2 (binary: 10) 
 */