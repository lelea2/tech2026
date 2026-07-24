/**
 * prerequisites[i] = [task, prerequisite]
 *
 * Returns:
 * {
 *   order: global topological order,
 *   successors: Map<task, successorTasksInTopologicalOrder>
 * }
 */
function topologicalSortWithSuccessors(tasks, prerequisites) {
  const graph = new Map();
  const indegree = new Map();

  // Initialize every task.
  for (const task of tasks) {
    graph.set(task, []);
    indegree.set(task, 0);
  }

  // Build prerequisite -> dependent edges.
  for (const [task, prerequisite] of prerequisites) {
    if (!graph.has(task) || !graph.has(prerequisite)) {
      throw new Error("Unknown task");
    }

    graph.get(prerequisite).push(task);
    indegree.set(task, indegree.get(task) + 1);
  }

  // Part 1: Kahn's algorithm.
  const queue = [];

  for (const task of tasks) {
    if (indegree.get(task) === 0) {
      queue.push(task);
    }
  }

  const order = [];
  let front = 0;

  while (front < queue.length) {
    const task = queue[front++];
    order.push(task);

    for (const nextTask of graph.get(task)) {
      indegree.set(nextTask, indegree.get(nextTask) - 1);

      if (indegree.get(nextTask) === 0) {
        queue.push(nextTask);
      }
    }
  }

  if (order.length !== tasks.length) {
    throw new Error("The graph contains a cycle");
  }

  // Part 2: Find all reachable successors for each task.
  const successors = new Map();

  for (const startTask of tasks) {
    const reachable = new Set();
    const stack = [...graph.get(startTask)];

    while (stack.length > 0) {
      const currentTask = stack.pop();

      if (reachable.has(currentTask)) {
        continue;
      }

      reachable.add(currentTask);

      for (const nextTask of graph.get(currentTask)) {
        stack.push(nextTask);
      }
    }

    // Filtering the global order automatically gives us
    // the successors in topological order.
    successors.set(
      startTask,
      order.filter(task => reachable.has(task))
    );
  }

  return { order, successors };
}

// Numerical example:
const result = topologicalSortWithSuccessors(
  [0, 1, 2, 3],
  [
    [1, 0],
    [2, 0],
    [3, 1],
    [3, 2]
  ]
);

console.log(result.order);
// [0, 1, 2, 3]

console.log(Object.fromEntries(result.successors));
// {
//   0: [1, 2, 3],
//   1: [3],
//   2: [3],
//   3: []
// }

// String example:
const result2 = topologicalSortWithSuccessors(
  ["A", "B", "C", "D"],
  [
    ["B", "A"],
    ["C", "A"],
    ["D", "B"],
    ["D", "C"]
  ]
);

console.log(result2.order);
// ["A", "B", "C", "D"]

console.log(Object.fromEntries(result2.successors));
// {
//   A: ["B", "C", "D"],
//   B: ["D"],
//   C: ["D"],
//   D: []
// }