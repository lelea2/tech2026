// Find (x, y, k, b) satisfying y = kx + b
// Or this can be rearranged to y - b = k * x
// We can use a hash map to store all possible products k * x
// Then for each pair (y, b), we can check if y - b exists in the hash map
// If it does, we can return the corresponding (x, y, k, b) values
function findCombination(nums) {
  const productMap = new Map();

  // k * x
  for (let ki = 0; ki < nums.length; ki++) {
    for (let xi = 0; xi < nums.length; xi++) {
      if (ki === xi) continue;

      const product = nums[ki] * nums[xi];

      if (!productMap.has(product)) {
        productMap.set(product, []);
      }

      productMap.get(product).push([ki, xi]);
    }
  }

  // y - b
  for (let yi = 0; yi < nums.length; yi++) {
    for (let bi = 0; bi < nums.length; bi++) {
      if (yi === bi) continue;

      const target = nums[yi] - nums[bi];

      if (!productMap.has(target)) continue;

      for (const [ki, xi] of productMap.get(target)) {
        // Make sure all four elements are distinct
        if (new Set([yi, bi, ki, xi]).size === 4) {
          return {
            x: nums[xi],
            y: nums[yi],
            k: nums[ki],
            b: nums[bi],
          };
        }
      }
    }
  }

  return null;
}

// Time complexity: O(n^2) - we have two nested loops for both k*x and y-b
// Space complexity: O(n^2) - we store all possible products k*x in a hash map