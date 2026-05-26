/**
 * Highlight case-insensitive matches from multiple queries with <b>...</b> tags.
 *
 * Rules:
 * - Left-to-right greedy scan (earlier letters have priority).
 * - A character can only be consumed once by matched queries.
 * - Overlapping or consecutive matches are merged into one bold block.
 *
 * @param {string} content
 * @param {string[]} queries
 * @returns {string}
 */
export default function textSearch(content, queries) {
	if (content.length === 0 || queries.length === 0) {
		return content;
	}

	const contentLower = content.toLowerCase();

	// Normalize and ignore empty queries. Prefer longer match on same start index.
	const normalizedQueries = queries
		.map((query) => query.toLowerCase())
		.filter((query) => query.length > 0)
		.sort((a, b) => b.length - a.length);

	if (normalizedQueries.length === 0) {
		return content;
	}

	const rawRanges = [];

	// For each query independently, take non-overlapping matches from left to right.
	for (const query of normalizedQueries) {
		const qLen = query.length;
		let i = 0;

		while (i <= content.length - qLen) {
			const end = i + qLen;

			if (contentLower.slice(i, end) === query) {
				rawRanges.push([i, end]);
				i += qLen;
			} else {
				i++;
			}
		}
	}

	if (rawRanges.length === 0) {
		return content;
	}

	rawRanges.sort((a, b) => {
		if (a[0] !== b[0]) {
			return a[0] - b[0];
		}
		return a[1] - b[1];
	});

	// Merge touching/overlapping ranges into one bold segment.
	const mergedRanges = [rawRanges[0]];
	for (let j = 1; j < rawRanges.length; j++) {
		const [start, end] = rawRanges[j];
		const last = mergedRanges[mergedRanges.length - 1];

		if (start <= last[1]) {
			last[1] = Math.max(last[1], end);
		} else {
			mergedRanges.push([start, end]);
		}
	}

	let result = '';
	let cursor = 0;

	for (const [start, end] of mergedRanges) {
		result += content.slice(cursor, start);
		result += `<b>${content.slice(start, end)}</b>`;
		cursor = end;
	}

	result += content.slice(cursor);
	return result;
}

// Examples:
// textSearch('The quick brown fox jumps over the lazy dog', ['fox', 'dog'])
// => 'The quick brown <b>fox</b> jumps over the lazy <b>dog</b>'
//
// textSearch('This is Uncopyrightable!', ['copy', 'right', 'table'])
// => 'This is Un<b>copyrightable</b>!'
//
// textSearch('aaaa', ['aa'])
// => '<b>aaaa</b>'
