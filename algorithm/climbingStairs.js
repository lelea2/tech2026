// Time: O(n), Space: O(1)
export default function climbStairs(steps) {
  /**
   * Interview thought process:
   *
   * To reach step N, there are only two possibilities:
   * 1. We came from step N - 1 by taking 1 step.
   * 2. We came from step N - 2 by taking 2 steps.
   *
   * Therefore:
   * ways(N) = ways(N - 1) + ways(N - 2)
   *
   * This is the Fibonacci pattern.
   */

  // Base cases:
  // 1 step => [1]
  if (steps === 1) {
    return 1;
  }

  // 2 steps => [1+1], [2]
  if (steps === 2) {
    return 2;
  }

  /**
   * Instead of storing all previous results in an array,
   * we only need the last two values.
   *
   * prevTwo = ways(i - 2)
   * prevOne = ways(i - 1)
   */
  let prevTwo = 1; // ways(1)
  let prevOne = 2; // ways(2)

  // Build the answer from step 3 to step N.
  for (let currentStep = 3; currentStep <= steps; currentStep++) {
    const currentWays = prevOne + prevTwo;

    // Shift window forward.
    prevTwo = prevOne;
    prevOne = currentWays;
  }

  return prevOne;
}