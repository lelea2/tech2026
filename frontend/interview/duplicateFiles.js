/**
 * Interview Question:
 * You are given a list of files, where each file has:
 * - path: absolute file path
 * - hash: content hash (same hash => same file content)
 *
 * Return groups of duplicate files (only groups with size > 1).
 *
 * Example input:
 * [
 *   { path: '/a/1.txt', hash: 'abc' },
 *   { path: '/b/2.txt', hash: 'abc' },
 *   { path: '/c/3.txt', hash: 'xyz' }
 * ]
 *
 * Example output:
 * [
 *   ['/a/1.txt', '/b/2.txt']
 * ]
 *
 * Follow-up interview prompts:
 * 1) What are time and space complexities?
 * 2) How would you handle very large input (streaming / chunking)?
 * 3) How would you return stable ordering of groups and paths?
 */
function groupDuplicateFiles(files) {
  const hashToPaths = new Map();

  for (const file of files) {
    const { path, hash } = file;

    if (!hashToPaths.has(hash)) {
      hashToPaths.set(hash, []);
    }

    hashToPaths.get(hash).push(path);
  }

  const result = [];

  for (const paths of hashToPaths.values()) {
    if (paths.length > 1) {
      result.push(paths);
    }
  }

  return result;
}


// Quick interview check:
// - files sharing the same hash are grouped together.
// - unique hashes are excluded from the final result.
// const files = [
//   { path: "/a/1.txt", hash: "abc" },
//   { path: "/b/2.txt", hash: "abc" },
//   { path: "/c/3.txt", hash: "xyz" }
// ];

// console.log(groupDuplicateFiles(files));
// Output
// [
//   ["/a/1.txt", "/b/2.txt"]
// ]