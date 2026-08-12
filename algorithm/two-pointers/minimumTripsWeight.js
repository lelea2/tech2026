function minimumTrips(weights) {
  weights.sort((a, b) => a - b);

  let left = 0;
  let right = weights.length - 1;
  let trips = 0;

  while (left <= right) {
    // Try to pair lightest + heaviest
    if (
      left < right &&
      weights[left] + weights[right] <= 3.0
    ) {
      left++;
    }

    // Heaviest bag is always taken
    right--;
    trips++;
  }

  return trips;
}

// Assume:

// * Each bag weighs between 1.01 and 3.00 lb
// * Janitor can carry at most 3.00 lb per trip
// * At most 2 bags per trip
// * Goal: minimum number of trips

// Idea in words

// 1. Sort the bags by weight.
// 2. Keep two pointers:
//     * left → lightest bag
//     * right → heaviest bag
// 3. The heaviest bag must be carried now.
// 4. Try pairing it with the lightest remaining bag:
//     * If their total is <= 3.0, carry both together and move both pointers.
//     * Otherwise, the heaviest bag must go alone. Move only right.
// 5. Every time we remove the heaviest bag, that’s one trip.
// 6. Continue until all bags are gone.