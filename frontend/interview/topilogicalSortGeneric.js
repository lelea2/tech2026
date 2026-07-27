/**
 * prerequisites[i] = [task, prerequisite]
 *
 * Example:
 * ["B", "A"] means A must finish before B.
 */
function topologicalSort(tasks, prerequisites) {
  const graph = new Map();
  const indegree = new Map();

  // Initialize every task.
  for (const task of tasks) {
    graph.set(task, []);
    indegree.set(task, 0);
  }

  // Build the graph.
  for (const [task, prerequisite] of prerequisites) {
    graph.get(prerequisite).push(task);
    indegree.set(task, indegree.get(task) + 1);
  }

  // Start with tasks that have no prerequisites.
  const queue = [];

  for (const task of tasks) {
    if (indegree.get(task) === 0) {
      queue.push(task);
    }
  }

  const order = [];
  let front = 0;

  // The queue stores tasks that are ready to run—tasks whose prerequisite count has reached 0.
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

  // Fewer processed tasks means a cycle exists.
  if (order.length !== tasks.length) {
    return [];
  }

  return order;
}

const tasks = ["A", "B", "C", "D"];

const prerequisites = [
  ["B", "A"], // A before B
  ["C", "A"], // A before C
  ["D", "B"], // B before D
  ["D", "C"]  // C before D
];

console.log(topologicalSort(tasks, prerequisites));

// ["A", "B", "C", "D"]