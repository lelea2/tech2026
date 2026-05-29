/**
 * @param {number[]} prices
 * @return {number}
 */
export default function optimalStockTrading(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;

  for (const price of prices) {
    minPrice = Math.min(price, minPrice);
    maxProfit = Math.max(price - minPrice, maxProfit);
  }
  return maxProfit;
}