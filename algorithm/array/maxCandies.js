// Problem: Give each child at least one candy; children with higher ratings
// than adjacent children must receive more candies. Return the minimum total.
// Example: n = 3, ratings = [1, 0, 2]
// Output: 5 (candies = [2, 1, 2])
function candies(n, arr) {
  const candy = new Array(n).fill(1);

  // Left -> Right
  for (let i = 1; i < n; i++) {
    if (arr[i] > arr[i - 1]) {
      candy[i] = candy[i - 1] + 1;
    }
  }

  // Right -> Left
  for (let i = n - 2; i >= 0; i--) {
    if (arr[i] > arr[i + 1]) {
      candy[i] = Math.max(candy[i], candy[i + 1] + 1);
    }
  }

  return candy.reduce((sum, value) => sum + value, 0);
}