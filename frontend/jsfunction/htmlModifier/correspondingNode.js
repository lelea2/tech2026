/**
 * @param {Node} rootA
 * @param {Node} rootB
 * @param {Node} target
 * @return {Node}
 */
/**
 * Find the corresponding node in rootB by relative position.
 *
 * Data structure:
 * - DOM tree / N-ary tree
 *
 * Idea:
 * - Walk from target up to rootA.
 * - Record each node's index among parent.childNodes.
 * - Reverse that path.
 * - Starting at rootB, follow the same child indexes.
 *
 * @param {Node} rootA
 * @param {Node} rootB
 * @param {Node} target
 * @returns {Node}
 */
export default function correspondingNodeAcrossPages(rootA, rootB, target) {
  const path = [];

  let current = target;

  while (current !== rootA) {
    const parent = current.parentNode;
    const index = Array.prototype.indexOf.call(parent.childNodes, current);

    path.push(index);
    current = parent;
  }

  let result = rootB;

  for (let i = path.length - 1; i >= 0; i--) {
    result = result.childNodes[path[i]];
  }

  return result;
}