/**
 * Creates an object composed of keys generated
 * from iteratee results and values representing
 * the count of occurrences.
 *
 * Time Complexity:
 * O(n)
 *
 * Space Complexity:
 * O(k)
 * where k = number of unique keys
 *
 * @param {Array} array
 * @param {(value: any) => any} iteratee
 * @returns {Object}
 */
export default function countBy(array, iteratee) {
  const result = {};

  for (const item of array) {
    // Generate grouping key
    const key = iteratee(item);

    // Initialize count if missing
    if (!(key in result)) {
      result[key] = 0;
    }

    // Increment count
    result[key] += 1;
  }

  return result;
}

/**
countBy([6.1, 4.2, 6.3], Math.floor);
// => { '4': 1, '6': 2 }

countBy([{ n: 3 }, { n: 5 }, { n: 3 }], (o) => o.n);
// => { '3': 2, '5': 1 }

countBy([], (o) => o); // => {}

countBy([{ n: 1 }, { n: 2 }], (o) => o.m); // => { undefined: 2 }

 */