/**
 * Real-time collaboration apps like Google Docs and Figma often sync actions 
 * between two webpages 
 * that render the same DOM structure. 
 * For example, hovering, selecting, or inspecting a node on one page 
 * might require highlighting the corresponding node on the other page.
---------------
Implement correspondingNodeAcrossPages(rootA, rootB, target), 
which takes the root nodes of two pages with the same DOM structure 
and a target node inside rootA, then returns the node in rootB 
at the same relative position.
 */
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