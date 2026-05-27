/**
 * @typedef {{
 *   total: number,
 *   passed: number,
 *   failed: number,
 *   results: Array<
 *     | { name: string, status: 'passed' }
 *     | { name: string, status: 'failed', error: string }
 *   >,
 * }} RunResult
 *
 * @typedef {() => void} SpecFn
 *
 * @typedef {{
 *   toBe: (expected: unknown) => void,
 *   not: Matcher,
 * }} Matcher
 *
 * @typedef {{
 *   spec: (name: string, fn: SpecFn) => void,
 *   check: (actual: unknown) => Matcher,
 *   run: () => RunResult,
 * }} TestRunner
 */

/**
 * Mini synchronous test runner.
 *
 * Data structure:
 * - Array of specs stored in closure state
 *
 * Core idea:
 * - spec() registers tests
 * - check() creates matcher object
 * - run() executes specs later in order
 *
 * @returns {{
 *   spec: (name: string, fn: Function) => void,
 *   check: (actual: unknown) => any,
 *   run: () => object,
 * }}
 */
export default function createTestRunner() {
  const specs = [];

  function spec(name, fn) {
    specs.push({ name, fn });
  }

  function check(actual) {
    return createMatchers(actual, false);
  }

  function createMatchers(actual, negated) {
    return {
      get not() {
        return createMatchers(actual, !negated);
      },

      toBe(expected) {
        const pass = Object.is(actual, expected);

        if (!negated && !pass) {
          throw new Error(
            `Expected ${String(actual)} to be ${String(expected)}`,
          );
        }

        if (negated && pass) {
          throw new Error(
            `Expected ${String(actual)} not to be ${String(expected)}`,
          );
        }
      },
    };
  }

  function run() {
    const results = [];

    for (const { name, fn } of specs) {
      try {
        fn();

        results.push({
          name,
          status: 'passed',
        });
      } catch (error) {
        results.push({
          name,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const failed = results.filter((result) => result.status === 'failed').length;
    const passed = results.length - failed;

    return {
      total: results.length,
      passed,
      failed,
      results,
    };
  }

  return {
    spec,
    check,
    run,
  };
}