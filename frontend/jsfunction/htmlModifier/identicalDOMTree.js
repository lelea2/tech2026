/**
 * * Check whether two DOM trees are identical.
 *
 * Two trees are identical if:
 * - same node type
 * - same node name/tag
 * - same node value/text
 * - same attributes
 * - same number of children
 * - children are identical in the same order
 * ======================================================
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @return {boolean}
 */
export default function identicalDOMTrees(nodeA, nodeB) {
  if (!nodeA || !nodeB) {
    return false;
  }
  if (nodeA.nodeType !== nodeB.nodeType) {
    return false;
  }
  if (nodeA.nodeName !== nodeB.nodeName) {
    return false;
  }
  if (nodeA.nodeValue !== nodeB.nodeValue) {
    return false;
  }
  if (!sameAttributes(nodeA, nodeB)) {
    return false;
  }

  if (nodeA.childNodes.length !== nodeB.childNodes.length) {
    return false;
  }

  for (let i = 0; i < nodeA.childNodes.length; i++) {
    if (!identicalDOMTrees(nodeA.childNodes[i], nodeB.childNodes[i])) {
      return false;
    }
  }
  return true;
}

function sameAttributes(nodeA, nodeB) {
  if (!nodeA.attributes && !nodeB.attributes) { // no attributes in both node
    return true;
  }
  if (!nodeA.attributes || !nodeB.attributes) {
    return false;
  }
  for (const attr of nodeA.attributes) {
    if (nodeB.getAttribute(attr.name) !== attr.value) {
      return false;
    }
  }
  return true;
}