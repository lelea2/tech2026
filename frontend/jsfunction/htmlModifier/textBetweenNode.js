/**
 * Return text chunks between startNode and endNode inclusive.
 *
 * Data structure:
 * - DOM is an N-ary tree
 *
 * Algorithm:
 * - DFS preorder traversal
 * - Start collecting once startNode is reached
 * - Include text nodes while collecting
 * - Stop after endNode subtree is fully processed
 *
 * @param {Node} startNode
 * @param {Node} endNode
 * @returns {string[]}
 */
export default function textBetweenNodes(startNode, endNode) {
  const root = startNode.getRootNode();
  const result = [];

  let collecting = false;
  let done = false;

  function dfs(node) {
    if (!node || done) {
      return;
    }
    if (node === startNode) {
      collecting = true;
    }
    if (collecting && node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text !== '') {
        result.push(text);
      }
    }
    for (const child of node.childNodes) {
      dfs(child);
    }
    // Stop only after visiting endNode's subtree.
    if (node === endNode) {
      done = true;
    }
  }

  dfs(root);
  return result;
}

/**
 * const doc = new DOMParser().parseFromString(
  `
    <main>
      <section>
        <h1>Title</h1>
        <p>Intro</p>
      </section>
      <section>
        <p>Body</p>
        <footer><span>Tail</span></footer>
      </section>
      <aside>After</aside>
    </main>
  `,
  'text/html',
);

const main = doc.body.firstChild;
const startNode = main.childNodes[0];
const endNode = main.childNodes[1];

textBetweenNodes(startNode, endNode);
// ['Title', 'Intro', 'Body', 'Tail']
------
const doc = new DOMParser().parseFromString(
  `
    <main>
      <p>Alpha</p>
      <p>Beta</p>
    </main>
  `,
  'text/html',
);

const textNode = doc.body.firstChild.childNodes[0].firstChild;

textBetweenNodes(textNode, textNode);
// ['Alpha']
 */