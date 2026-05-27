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
 */
/**
 * The structure is the same as the synchronous runner.
The main change is run() becomes async.
For each registered spec, I await each step in order:

1. setup hooks from outer suite to inner suite
2. spec function
3. cleanup hooks from inner suite to outer suite
I still execute specs sequentially using a normal for...of loop.
I do not use Promise.all because the requirement says specs must not run in parallel.
 */
export default function createTestRunner() {
  const specs = [];

  const rootSuite = {
    name: "",
    setupHooks: [],
    cleanupHooks: [],
  };

  const suiteStack = [rootSuite];

  function suite(name, fn) {
    const suiteContext = {
      name,
      setupHooks: [],
      cleanupHooks: [],
    };

    suiteStack.push(suiteContext);

    try {
      fn();
    } finally {
      suiteStack.pop();
    }
  }

  function setupEach(fn) {
    suiteStack[suiteStack.length - 1].setupHooks.push(fn);
  }

  function cleanupEach(fn) {
    suiteStack[suiteStack.length - 1].cleanupHooks.push(fn);
  }

  function spec(name, fn) {
    const suitePath = suiteStack.slice(1).map((suite) => suite.name);

    specs.push({
      name: [...suitePath, name].join(" > "),
      fn,
      setupHooks: suiteStack.flatMap((suite) => suite.setupHooks),
      cleanupHooks: suiteStack.flatMap((suite) => suite.cleanupHooks).reverse(),
    });
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

  async function run() {
    const results = [];

    for (const test of specs) {
      try {
        for (const hook of test.setupHooks) {
          await hook();
        }

        await test.fn();

        for (const hook of test.cleanupHooks) {
          await hook();
        }

        results.push({
          name: test.name,
          status: "passed",
        });
      } catch (error) {
        results.push({
          name: test.name,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const failed = results.filter(
      (result) => result.status === "failed",
    ).length;

    return {
      total: results.length,
      passed: results.length - failed,
      failed,
      results,
    };
  }

  return {
    suite,
    spec,
    check,
    run,
    setupEach,
    cleanupEach,
  };
}
