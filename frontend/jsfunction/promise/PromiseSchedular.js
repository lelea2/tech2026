/**
 * Interview Prompt: Serial Promise Scheduler
 *
 * Requirement:
 * 1. Accept an array of functions where each function may be sync or async.
 * 2. Execute functions strictly one-by-one (serial order by index).
 * 3. Support pause/resume without re-running completed work.
 * 4. Collect per-index results and per-index errors.
 * 5. Expose runner status so callers can inspect progress.
 *
 * Behavioral Notes:
 * - A failed function is still considered attempted and is marked as executed.
 * - Results preserve original input ordering (index-aligned arrays).
 * - Calling run() during an active run returns the same in-flight promise.
 *
 * Primary return values:
 * - run(): Promise<Array<any>>
 *   Resolves to the full results array (with empty slots for not-yet-successful indices).
 * - pause(): Promise<void>
 *   Resolves once current in-flight function finishes and scheduler reaches Paused state.
 * - runAllUnexecutedFunctions(): Promise<Array<any>>
 *   Resumes and resolves to results after remaining functions are attempted.
 * - getState(): snapshot object with state, pointer, pending indices, results, and errors.
 */
class SerialFunctionRunner {
  static State = {
    Idle: "Idle",
    InProgress: "InProgress",
    Paused: "Paused",
    Completed: "Completed",
  };

  /**
   * @param {Array<() => any | Promise<any>>} functions
   */
  constructor(functions) {
    if (!Array.isArray(functions)) {
      throw new TypeError("Expected an array of functions");
    }

    for (const fn of functions) {
      if (typeof fn !== "function") {
        throw new TypeError("Every item must be a function");
      }
    }

    this.functions = functions;

    this.state = SerialFunctionRunner.State.Idle;

    // Tracks which function indices have already executed successfully.
    this.executed = new Set();

    // Store results by original function index.
    this.results = new Array(functions.length);

    // Store errors by original function index.
    this.errors = new Array(functions.length);

    this.currentIndex = 0;

    this.pauseRequested = false;

    // Used so pause() can wait until the current function finishes.
    this.pauseWaiters = [];

    // Prevent multiple concurrent run loops.
    this.runningPromise = null;
  }

  /**
    * Returns a read-only snapshot of scheduler progress.
    *
    * @returns {{
    *   state: string,
    *   currentIndex: number,
    *   unexecutedIndices: number[],
    *   results: Array<any>,
    *   errors: Array<any>
    * }}
    * - state: Idle | InProgress | Paused | Completed
    * - currentIndex: next index the loop will inspect
    * - unexecutedIndices: indices not attempted yet
    * - results/errors: index-aligned arrays for completed attempts
   */
  getState() {
    const unexecutedIndices = [];

    for (let i = 0; i < this.functions.length; i++) {
      if (!this.executed.has(i)) {
        unexecutedIndices.push(i);
      }
    }

    return {
      state: this.state,
      currentIndex: this.currentIndex,
      unexecutedIndices,
      results: [...this.results],
      errors: [...this.errors],
    };
  }

  /**
   * Runs functions serially from the current index.
   *
   * If paused, calling run() resumes execution.
   *
    * @returns {Promise<Array<any>>}
    * Resolves with the results array when:
    * - all functions are attempted, or
    * - execution pauses before completion.
    *
    * Does not throw for per-function failures; errors are stored in this.errors.
   */
  async run() {
    if (this.state === SerialFunctionRunner.State.Completed) {
      return this.results;
    }

    // If already running, return the same promise instead of starting another loop.
    if (this.runningPromise) {
      return this.runningPromise;
    }

    this.pauseRequested = false;
    this.state = SerialFunctionRunner.State.InProgress;

    this.runningPromise = this.#runLoop();

    try {
      return await this.runningPromise;
    } finally {
      this.runningPromise = null;
    }
  }

  /**
   * Requests pause.
   *
   * If a function is currently running, we wait until it finishes.
   * Then execution stops before starting the next function.
   *
  * Return behavior:
  * - If already Completed: resolves immediately.
  * - If not currently running: marks Paused and resolves immediately.
  * - If running: resolves when current function finishes and loop pauses.
  *
   * @returns {Promise<void>}
   */
  async pause() {
    if (this.state === SerialFunctionRunner.State.Completed) {
      return;
    }

    if (this.state !== SerialFunctionRunner.State.InProgress) {
      this.pauseRequested = true;
      this.state = SerialFunctionRunner.State.Paused;
      return;
    }

    this.pauseRequested = true;

    return new Promise((resolve) => {
      this.pauseWaiters.push(resolve);
    });
  }

  /**
   * Executes all unexecuted functions.
   *
   * This resumes from paused state and continues until everything unexecuted runs.
   *
    * @returns {Promise<Array<any>>}
    * Resolves with the same index-aligned results array managed by the runner.
   */
  async runAllUnexecutedFunctions() {
    this.pauseRequested = false;
    return this.run();
  }

  /**
    * Private serial execution loop.
    *
    * @returns {Promise<Array<any>>}
    * Returns results when paused or completed.
    *
    * Time Complexity:
    * - O(n) total across full execution (n = number of functions).
    *
    * Space Complexity:
    * - O(n) for results/errors/executed bookkeeping.
   */
  async #runLoop() {
    while (this.currentIndex < this.functions.length) {
      if (this.pauseRequested) {
        this.state = SerialFunctionRunner.State.Paused;
        this.#resolvePauseWaiters();
        return this.results;
      }

      const index = this.currentIndex;

      // Skip already executed functions.
      // This is helpful if runAllUnexecutedFunctions() is called after partial progress.
      if (this.executed.has(index)) {
        this.currentIndex++;
        continue;
      }

      const fn = this.functions[index];

      try {
        /**
         * Promise.resolve allows us to support both:
         *
         * 1. sync functions:
         *    () => 123
         *
         * 2. async functions:
         *    async () => 123
         */
        const result = await Promise.resolve(fn());

        this.results[index] = result;
        this.executed.add(index);
      } catch (error) {
        this.errors[index] = error;

        // Mark as executed because the function was attempted.
        // If you want failed functions to be retried later, remove this line.
        this.executed.add(index);
      }

      this.currentIndex++;

      if (this.pauseRequested) {
        this.state = SerialFunctionRunner.State.Paused;
        this.#resolvePauseWaiters();
        return this.results;
      }
    }

    this.state = SerialFunctionRunner.State.Completed;
    this.#resolvePauseWaiters();

    return this.results;
  }

  #resolvePauseWaiters() {
    while (this.pauseWaiters.length > 0) {
      const resolve = this.pauseWaiters.shift();
      resolve();
    }
  }
}