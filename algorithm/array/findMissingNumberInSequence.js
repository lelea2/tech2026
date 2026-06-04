/***
 * Given an array numbers of size n storing n different integers which 
 * fall within the range [0, n], implement a function to identify the missing element 
 * in the array. All numbers except one are present in the array. Find the missing number.
 */
/**
 * @param {number[]} numbers
 * @return {number}
 */
// Why it works
// * a ^ a = 0
// * a ^ 0 = a
// Every number that appears cancels itself out, leaving only the missing number.
// Complexity
// * Time: O(n)
// * Space: O(1)
export default function findMissingNumberInSequence(numbers) {
  let xor = numbers.length;
  for (let i = 0; i < numbers.length; i++) {
    xor ^= i;
    xor ^= numbers[i];
  }
  return xor;
}

/**
 * // Brute force approach using the sum of an arithmetic sequence.
 * @param {number[]} numbers
 * @return {number}
 */
// this approach has a time complexity of O(n) and a space complexity of O(1).
// assuming the input array is valid and contains exactly one missing number.
/**
function missingNumber(numbers) {
  const n = numbers.length;

  const expectedSum = (n * (n + 1)) / 2;

  let actualSum = 0;
  for (const num of numbers) {
    actualSum += num;
  }

  return expectedSum - actualSum;

 */