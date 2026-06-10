/**
 * Interview Question:
 * Implement a retry helper that can run a sync or async function, retry it when
 * it fails, and eventually return the successful result or throw the last error.
 *
 * Requirements:
 * - Support configurable maximum attempts
 * - Support no delay, fixed delay, or exponential delay between retries
 * - Allow callers to decide whether an error should be retried
 * - Expose an optional callback each time a retry is scheduled
 */

/**
 * Sleep helper.
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fixed delay strategy.
 *
 * Example:
 * delay: fixedDelay(1000)
 * means retry every 1000ms.
 *
 * @param {number} intervalMs
 * @returns {(attempt: number) => number}
 */
function fixedDelay(intervalMs) {
  return function getDelay() {
    return intervalMs;
  };
}

/**
 * Exponential delay strategy.
 *
 * Example:
 * exponentialDelay({ baseMs: 500, factor: 2, maxMs: 5000 })
 *
 * attempt 1 -> 500ms
 * attempt 2 -> 1000ms
 * attempt 3 -> 2000ms
 * attempt 4 -> 4000ms
 * attempt 5 -> 5000ms capped
 *
 * @param {{
 *   baseMs?: number;
 *   factor?: number;
 *   maxMs?: number;
 * }} options
 * @returns {(attempt: number) => number}
 */
function exponentialDelay(options = {}) {
  const {
    baseMs = 500,
    factor = 2,
    maxMs = Infinity,
  } = options;

  return function getDelay(attempt) {
    const delay = baseMs * Math.pow(factor, attempt - 1);
    return Math.min(delay, maxMs);
  };
}

/**
 * Retry a sync or async function.
 *
 * @template T
 *
 * @param {() => T | Promise<T>} fn
 * @param {{
 *   maxAttempts?: number;
 *   delay?: number | ((attempt: number, error: unknown) => number);
 *   shouldRetry?: (error: unknown, attempt: number) => boolean | Promise<boolean>;
 *   onRetry?: (info: {
 *     error: unknown;
 *     attempt: number;
 *     maxAttempts: number;
 *     delayMs: number;
 *   }) => void;
 * }} options
 *
 * @returns {Promise<T>}
 */
async function retryer(fn, options = {}) {
  const {
    maxAttempts = 3,
    delay = 0,
    shouldRetry = () => true,
    onRetry,
  } = options;

  if (typeof fn !== "function") {
    throw new TypeError("retryer expected fn to be a function");
  }

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new TypeError("maxAttempts must be an integer greater than or equal to 1");
  }

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await Promise.resolve(fn());
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === maxAttempts;

      if (isLastAttempt) {
        throw lastError;
      }

      const canRetry = await Promise.resolve(shouldRetry(error, attempt));

      if (!canRetry) {
        throw lastError;
      }

      const delayMs =
        typeof delay === "function"
          ? delay(attempt, error)
          : delay;

      if (onRetry) {
        onRetry({
          error,
          attempt,
          maxAttempts,
          delayMs,
        });
      }

      if (delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}


/** 
 * Example1: Fixed Interval retries
 */
let count = 0;

async function unstableApiCall() {
  count++;

  if (count < 3) {
    throw new Error("API failed");
  }

  return "Success!";
}

retryer(unstableApiCall, {
  maxAttempts: 5,
  delay: fixedDelay(1000),
  onRetry: ({ attempt, delayMs, error }) => {
    console.log(
      `Attempt ${attempt} failed: ${error.message}. Retrying in ${delayMs}ms`
    );
  },
}).then(console.log);
// Attempt 1 failed: API failed. Retrying in 1000ms
// Attempt 2 failed: API failed. Retrying in 1000ms
// Success!


/**
 * Example2: Exponential Backoff retries
 */
let attempts = 0;

async function flakyRequest() {
  attempts++;

  if (attempts < 4) {
    throw new Error("Temporary failure");
  }

  return "Done";
}

retryer(flakyRequest, {
  maxAttempts: 5,
  delay: exponentialDelay({
    baseMs: 500,
    factor: 2,
    maxMs: 5000,
  }),
  onRetry: ({ attempt, delayMs }) => {
    console.log(`Retry ${attempt}, waiting ${delayMs}ms`);
  },
}).then(console.log);

// attempt 1 failed -> wait 500ms
// attempt 2 failed -> wait 1000ms
// attempt 3 failed -> wait 2000ms
// attempt 4 succeeds

/**
 * Test the retryer function with a simple case.
 */
async function runTests() {
  // -----------------------------
  // Test 1: succeeds immediately
  // -----------------------------
  {
    const result = await retryer(() => "ok", {
      maxAttempts: 3,
    });

    console.assert(result === "ok", "Test 1 failed");
  }

  // -----------------------------
  // Test 2: retries sync function
  // -----------------------------
  {
    let attempts = 0;

    const result = await retryer(() => {
      attempts++;

      if (attempts < 3) {
        throw new Error("fail");
      }

      return "success";
    }, {
      maxAttempts: 5,
    });

    console.assert(result === "success", "Test 2 result failed");
    console.assert(attempts === 3, "Test 2 attempts failed");
  }

  // -----------------------------
  // Test 3: retries async function
  // -----------------------------
  {
    let attempts = 0;

    const result = await retryer(async () => {
      attempts++;

      if (attempts < 2) {
        throw new Error("async fail");
      }

      return "async success";
    }, {
      maxAttempts: 3,
    });

    console.assert(result === "async success", "Test 3 result failed");
    console.assert(attempts === 2, "Test 3 attempts failed");
  }

  // -----------------------------
  // Test 4: throws after max attempts
  // -----------------------------
  {
    let attempts = 0;

    try {
      await retryer(() => {
        attempts++;
        throw new Error("always fails");
      }, {
        maxAttempts: 3,
      });

      console.assert(false, "Test 4 should have thrown");
    } catch (error) {
      console.assert(error.message === "always fails", "Test 4 error failed");
      console.assert(attempts === 3, "Test 4 attempts failed");
    }
  }

  // -----------------------------
  // Test 5: shouldRetry can stop retries
  // -----------------------------
  {
    let attempts = 0;

    try {
      await retryer(() => {
        attempts++;
        throw new Error("do not retry");
      }, {
        maxAttempts: 5,
        shouldRetry: () => false,
      });

      console.assert(false, "Test 5 should have thrown");
    } catch (error) {
      console.assert(error.message === "do not retry", "Test 5 error failed");
      console.assert(attempts === 1, "Test 5 attempts failed");
    }
  }

  // -----------------------------
  // Test 6: fixed delay returns same delay
  // -----------------------------
  {
    const delay = fixedDelay(1000);

    console.assert(delay(1) === 1000, "Test 6 attempt 1 failed");
    console.assert(delay(5) === 1000, "Test 6 attempt 5 failed");
  }

  // -----------------------------
  // Test 7: exponential delay increases
  // -----------------------------
  {
    const delay = exponentialDelay({
      baseMs: 100,
      factor: 2,
      maxMs: 1000,
    });

    console.assert(delay(1) === 100, "Test 7 attempt 1 failed");
    console.assert(delay(2) === 200, "Test 7 attempt 2 failed");
    console.assert(delay(3) === 400, "Test 7 attempt 3 failed");
    console.assert(delay(5) === 1000, "Test 7 max cap failed");
  }

  console.log("All tests passed");
}

runTests();