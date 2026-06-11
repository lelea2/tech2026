/**
 * Interview Question:
 * Given a graph represented as an adjacency list and a source node, implement
 * depth-first search.
 *
 * Requirements:
 * - Visit nodes by exploring each path as deeply as possible before backtracking
 * - Return the traversal order as an array
 * - Use recursion to perform the traversal
 * - Track visited nodes so cycles do not cause infinite loops
 * - Return an empty array when the graph or source is invalid
 *
 * Follow-up:
 * Discuss time and space complexity in terms of V vertices and E edges.
 */

/**
 * @param {Record<string, Array<string>>} graph The adjacency list representing the graph.
 * @param {string} source The source node to start traversal from. It has to exist as a node in the graph.
 * @return {Array<string>} A DFS-traversed order of nodes.
 */
export default function depthFirstSearch(graph, source) {
  if (!graph || !source || !graph[source]) {
    return [];
  }
  if (Object.keys(graph).length === 0) {
    return [];
  }
  const result = [];
  const visited = new Set();

  function dfs(node) {
    // Avoid visiting the same node more than once,
    // especially important when the graph has cycles.
    if (visited.has(node)) {
      return;
    }

    visited.add(node);
    result.push(node);

    const neighbors = graph[node] || [];

    for (const neighbor of neighbors) {
      dfs(neighbor);
    }
  }

  dfs(source);

  return result;
}
