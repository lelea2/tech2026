/**
 * Given a positive integer num, determine the number of set bits (1s) present in the binary 
 * representation of the given number, commonly referred to as the Hamming weight.
 */
/**
 * @param {number} num
 * @return {number}
 */
export default function countOnesInBinary(num) {
  let count = 0;

  while (num > 0) {
    // hamming weight, bit manipulation 
    // n && (n - 1)
    num &= num - 1;
    count++;
  }

  return count;
}