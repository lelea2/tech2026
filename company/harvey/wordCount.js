// -----------------------------
// Shared helper
// -----------------------------

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// -----------------------------
// Phase 1
// Count source occurrences
// -----------------------------

function countSources(paragraph, sources) {
  const counts = {};

  for (const source of sources) {
    if (source.length === 0) {
      counts[source] = 0;
      continue;
    }

    const regex = new RegExp(escapeRegExp(source), "gi");
    const matches = paragraph.match(regex);

    counts[source] = matches ? matches.length : 0;
  }

  return counts;
}

// -----------------------------
// Phase 2
// Tag every matched source
// Simple version, does not handle overlap
// -----------------------------

function tagSources(paragraph, sources) {
  let result = paragraph;

  for (const source of sources) {
    if (source.length === 0) continue;

    const regex = new RegExp(escapeRegExp(source), "gi");

    result = result.replace(regex, (match) => {
      return `<source>${match}</source>`;
    });
  }

  return result;
}

// -----------------------------
// Phase 3
// Tag sources without overlapping or sequential tags
// -----------------------------

function findSourceRanges(paragraph, sources) {
  const ranges = [];

  for (const source of sources) {
    if (source.length === 0) continue;

    const regex = new RegExp(escapeRegExp(source), "gi");

    let match;

    while ((match = regex.exec(paragraph)) !== null) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        source,
        text: match[0],
      });
    }
  }

  return ranges;
}

function mergeRanges(ranges) {
  if (ranges.length === 0) return [];

  const sorted = [...ranges].sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }

    return b.end - a.end;
  });

  const merged = [];

  for (const range of sorted) {
    const last = merged[merged.length - 1];

    if (!last) {
      merged.push({
        start: range.start,
        end: range.end,
      });
      continue;
    }

    if (range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({
        start: range.start,
        end: range.end,
      });
    }
  }

  return merged;
}

function tagSourcesNoOverlap(paragraph, sources) {
  const ranges = findSourceRanges(paragraph, sources);
  const mergedRanges = mergeRanges(ranges);

  let result = paragraph;

  for (let i = mergedRanges.length - 1; i >= 0; i--) {
    const { start, end } = mergedRanges[i];

    result =
      result.slice(0, start) +
      "<source>" +
      result.slice(start, end) +
      "</source>" +
      result.slice(end);
  }

  return result;
}

// -----------------------------
// Tests
// -----------------------------

console.assert(
  JSON.stringify(
    countSources("React and JavaScript. React is popular.", [
      "React",
      "JavaScript",
    ])
  ) === JSON.stringify({ React: 2, JavaScript: 1 }),
  "Phase 1 Test failed"
);

console.assert(
  tagSources("React and JavaScript", ["React"]) ===
    "<source>React</source> and JavaScript",
  "Phase 2 Test failed"
);

console.assert(
  tagSourcesNoOverlap("JavaScript", ["Java", "JavaScript"]) ===
    "<source>JavaScript</source>",
  "Phase 3 overlap test failed"
);

console.assert(
  tagSourcesNoOverlap("NewYork", ["New", "York"]) ===
    "<source>NewYork</source>",
  "Phase 3 sequential test failed"
);

console.assert(
  tagSourcesNoOverlap("abcde", ["abc", "cde"]) ===
    "<source>abcde</source>",
  "Phase 3 nested/overlap test failed"
);

console.assert(
  tagSourcesNoOverlap("React Vue", ["React", "Vue"]) ===
    "<source>React</source> <source>Vue</source>",
  "Phase 3 separated phrase test failed"
);

console.log("All tests passed");