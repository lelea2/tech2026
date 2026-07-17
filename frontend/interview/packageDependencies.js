const packages = {
  A: ["B", "C", "D"],
  B: ["E", "F"],
  C: ["E", "D"],
  E: ["K"],
};

function getDependencies(packageName, packageMap = packages) {
  // Output in DFS discovery order (excluding the root package itself).
  const result = [];

  // `added`: ensures each dependency appears once in final output.
  const added = new Set();

  // Standard DFS states for directed graph traversal.
  // `visited`: fully processed node.
  // `visiting`: node on current recursion stack (used for cycle detection).
  const visited = new Set();
  const visiting = new Set();

  function dfs(current, path) {
    // Back-edge found: current node already in recursion stack => cycle.
    if (visiting.has(current)) {
      const cycleStart = path.indexOf(current);
      const cyclePath = [...path.slice(cycleStart), current];
      throw new Error(`Circular dependency detected: ${cyclePath.join(" -> ")}`);
    }

    // Already solved this subtree; skip repeated work.
    if (visited.has(current)) {
      return;
    }

    visiting.add(current);

    const dependencies = packageMap[current] || [];

    for (const dependency of dependencies) {
      // Record first time seen so output has unique dependencies.
      if (!added.has(dependency)) {
        added.add(dependency);
        result.push(dependency);
      }

      // Continue DFS to gather transitive dependencies.
      dfs(dependency, [...path, dependency]);
    }

    visiting.delete(current);
    visited.add(current);
  }

  // Start traversal from requested package.
  dfs(packageName, [packageName]);

  return result;
}

console.log(getDependencies("A"));
// ["B", "E", "K", "F", "C", "D"]