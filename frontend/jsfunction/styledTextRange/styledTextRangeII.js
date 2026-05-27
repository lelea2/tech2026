/**
 * In design tools, styling a text selection usually means splitting the affected runs, 
 * applying the new style, and then merging adjacent runs that now match.
Implement setTextRangeStyle(node, start, end, style) using the same simplified styled text representation as part 1.
 */
/**
 * Apply a style to text range [start, end).
 *
 * Idea:
 * - Split existing ranges around the target interval.
 * - Replace the overlapping part with the new style.
 * - Merge adjacent ranges with the same style.
 *
 * @param {{
 *   text: string,
 *   ranges: { start: number, end: number, style: string }[],
 * }} node
 * @param {number} start
 * @param {number} end
 * @param {string} style
 * @returns {{
 *   text: string,
 *   ranges: { start: number, end: number, style: string }[],
 * }}
 */
export default function setTextRangeStyle(node, start, end, style) {
  if (start === end) {
    return {
      text: node.text,
      ranges: node.ranges.map((range) => ({ ...range })),
    };
  }

  const ranges = [];

  for (const range of node.ranges) {
    // No overlap.
    if (range.end <= start || range.start >= end) {
      ranges.push({ ...range });
      continue;
    }

    // Left unaffected piece.
    if (range.start < start) {
      ranges.push({
        start: range.start,
        end: start,
        style: range.style,
      });
    }

    // Middle affected piece.
    ranges.push({
      start: Math.max(range.start, start),
      end: Math.min(range.end, end),
      style,
    });

    // Right unaffected piece.
    if (range.end > end) {
      ranges.push({
        start: end,
        end: range.end,
        style: range.style,
      });
    }
  }

  return {
    text: node.text,
    ranges: mergeAdjacentRanges(ranges),
  };
}

function mergeAdjacentRanges(ranges) {
  const merged = [];

  for (const range of ranges) {
    const last = merged[merged.length - 1];

    if (last && last.end === range.start && last.style === range.style) {
      last.end = range.end;
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

/**
 * Example usage:
 *   const node = {
 *     text: 'Hello, World!',
 *     ranges: [
 *       { start: 0, end: 5, style: 'bold' },
 *       { start: 7, end: 12, style: 'italic' },
 *     ],
 *   };
 *   const updated = setTextRangeStyle(node, 0, 5, 'underline');
 * 
 * setTextRangeStyle(
  {
    text: 'Hello world',
    ranges: [
      { start: 0, end: 6, style: 'body' },
      { start: 6, end: 11, style: 'bold' },
    ],
  },
  3,
  8,
  'highlight',
);
// {
//   text: 'Hello world',
//   ranges: [
//     { start: 0, end: 3, style: 'body' },
//     { start: 3, end: 8, style: 'highlight' },
//     { start: 8, end: 11, style: 'bold' },
//   ],
// }

 */