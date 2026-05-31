/**
 * @param {number} duration
 * @returns {Promise<void>}
 */
export default function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}
