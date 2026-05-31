
// Similar to Promise.withResolvers(): returns a new Promise together with
// external resolve/reject functions captured from the Promise executor.
// This improves readability when different code paths need to settle
// the same Promise from different parts of the program.

/**
 * @returns {{
 *   promise: Promise<unknown>,
 *   resolve: (value?: unknown) => void,
 *   reject: (reason?: unknown) => void,
 * }}
 */
export default function promiseWithResolvers() {
  /** @type {(value?: unknown) => void} */
  let resolve;
  /** @type {(reason?: unknown) => void} */
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject,
  };
}
