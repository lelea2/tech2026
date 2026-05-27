/**
 * Implement a function createResumableInterval, 
 * that acts like setInterval and has the exact same signature. 
 * However instead of returning a timer ID, it returns an object that contains three methods:
 * start: Runs the callback immediately and every delay milliseconds.
 * pause: Pauses the interval so that it stops running. Execution can be resumed by calling start() again.
 * stop: Stops the interval permanently, cannot be restarted.
=======
 * Create a resumable interval.
 *
 * Similar to setInterval, except it returns:
 * - start(): immediately invokes callback and starts interval
 * - pause(): temporarily pauses interval
 * - stop(): permanently stops interval
 *
 * Key ideas:
 * - Track interval ID
 * - Track paused/running/stopped state
 * - Prevent duplicate intervals
 *
 * @param {Function} callback
 * @param {number} delay
 * @param  {...any} args
 * @returns {{
 *   start: Function,
 *   pause: Function,
 *   stop: Function
 * }}
 */
export default function createResumableInterval(
  callback,
  delay,
  ...args
) {
  let timerId = null;

  // Whether interval has been permanently stopped.
  let stopped = false;

  // Whether interval is currently running.
  let running = false;

  function start() {
    // Cannot restart after stop().
    if (stopped || running) {
      return;
    }

    running = true;

    // Run immediately.
    callback(...args);

    timerId = setInterval(() => {
      callback(...args);
    }, delay);
  }

  function pause() {
    if (!running || stopped) {
      return;
    }

    clearInterval(timerId);
    timerId = null;
    running = false;
  }

  function stop() {
    if (stopped) {
      return;
    }

    clearInterval(timerId);

    timerId = null;
    running = false;
    stopped = true;
  }

  return {
    start,
    pause,
    stop,
  };
}