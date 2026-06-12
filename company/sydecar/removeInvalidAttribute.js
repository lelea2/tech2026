/**
 * Interview Question:
 * Given an array of objects, remove any attributes whose value is considered
 * invalid.
 *
 * Invalid values:
 * - "-"
 * - "N/A"
 * - ""
 *
 * Example:
 * [{ name: "Ada", title: "N/A", company: "Sydecar" }]
 * -> [{ name: "Ada", company: "Sydecar" }]
 *
 * Requirements:
 * - Process every object in the input array
 * - Keep keys whose values are valid
 * - Remove only keys with invalid values
 * - Return a new cleaned array instead of mutating the original objects
 *
 * Approach:
 * Store invalid values in a Set for O(1) lookup. For each object, build a new
 * object by copying only entries whose value is not in the invalid set.
 *
 * Complexity:
 * O(n * k) time where n is number of objects and k is average keys per object.
 * O(n * k) space for the cleaned output.
 *
 * Removes attributes from each object if the value is "-", "N/A", or "".
 *
 * @param {Array<Record<string, any>>} items
 * @return {Array<Record<string, any>>}
 */
export default function removeInvalidAttributes(items) {
  const invalidValues = new Set(["-", "N/A", ""]);

  return items.map((item) => {
    const cleaned = {};

    for (const [key, value] of Object.entries(item)) {
      if (!invalidValues.has(value)) {
        cleaned[key] = value;
      }
    }

    return cleaned;
  });
}

// const data = [
//   {
//     name: "Joe",
//     age: 30,
//     city: "",
//     job: "N/A",
//     status: "-",
//   },
//   {
//     name: "Emma",
//     age: "",
//     city: "San Jose",
//     job: "Engineer",
//   },
// ];

// console.log(removeInvalidAttributes(data));