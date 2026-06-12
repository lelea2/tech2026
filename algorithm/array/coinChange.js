/**
 * Interview Question:
 * Given an array of positive integers representing coin values, return the
 * minimum amount of change that cannot be created using those coins.
 *
 * Example:
 * coins = [5, 7, 1, 1, 2, 3, 22]
 * output = 20
 *
 * Answer:
 * Sort the coins in ascending order and track the largest amount of change we
 * can currently create, `currentChangeCreated`.
 *
 * If we can create every value from 1 through X, and the next coin is <= X + 1,
 * then we can extend the constructible range through X + coin.
 *
 * If the next coin is greater than X + 1, then X + 1 is impossible to create,
 * because all remaining coins are even larger.
 *
 * Complexity:
 * O(n log n) time for sorting and O(1) extra space.
 *
 * @param {number[]} coins
 * @return {number}
 */
export default function nonConstructibleChange(coins) {
  // Sort coins so we can expand the constructible range from smallest to largest.
  const sortedCoins = [...coins].sort((a, b) => a - b);

  // We can currently create every amount from 1 through this value.
  let currentChangeCreated = 0;

  for (const coin of sortedCoins) {
    // If the next coin is too large, there is a gap at currentChangeCreated + 1.
    if (coin > currentChangeCreated + 1) {
      return currentChangeCreated + 1;
    }

    // Otherwise, this coin extends the range of constructible change.
    currentChangeCreated += coin;
  }

  return currentChangeCreated + 1;
}
