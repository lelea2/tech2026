/**
 * Convert rich-text ranges into canonical HTML.
 * Earlier ranges in the input are rendered as outer tags.
 *
 * Supported range shapes:
 * - { start, end, tag }
 * - [start, end, tag]
 *
 * @param {string} text
 * @param {Array<{start:number,end:number,tag:string} | [number, number, string]>} ranges
 * @return {string}
 */
export default function richTextToHTML(text, ranges) {
	if (typeof text !== 'string' || text.length === 0) {
		return '';
	}

	const n = text.length;
	const starts = new Map();
	const ends = new Map();
	const points = new Set([0, n]);

	// Normalize and clamp ranges to valid half-open intervals.
	const normalized = [];
	for (let i = 0; i < (ranges || []).length; i++) {
		const range = ranges[i];
		let start;
		let end;
		let tag;

		if (Array.isArray(range)) {
			[start, end, tag] = range;
		} else if (range && typeof range === 'object') {
			({ start, end, tag } = range);
		} else {
			continue;
		}

		if (typeof tag !== 'string' || !/^[a-zA-Z][a-zA-Z0-9-]*$/.test(tag)) {
			continue;
		}

		const s = Math.max(0, Math.min(n, Number(start)));
		const e = Math.max(0, Math.min(n, Number(end)));

		if (!Number.isFinite(s) || !Number.isFinite(e) || s >= e) {
			continue;
		}

		const entry = { index: i, start: s, end: e, tag };
		normalized.push(entry);
		points.add(s);
		points.add(e);

		if (!starts.has(s)) {
			starts.set(s, []);
		}
		starts.get(s).push(entry);

		if (!ends.has(e)) {
			ends.set(e, []);
		}
		ends.get(e).push(entry);
	}

	const sortedPoints = [...points].sort((a, b) => a - b);
	const active = [];
	let prevActive = [];
	let html = '';

	for (let p = 0; p < sortedPoints.length - 1; p++) {
		const pos = sortedPoints[p];
		const nextPos = sortedPoints[p + 1];

		// For [start, end), ranges ending at pos are inactive, then ranges starting
		// at pos become active for the upcoming segment.
		const ending = ends.get(pos) || [];
		for (const item of ending) {
			const idx = active.findIndex((a) => a.index === item.index);
			if (idx >= 0) {
				active.splice(idx, 1);
			}
		}

		const starting = starts.get(pos) || [];
		for (const item of starting) {
			let insertAt = active.length;
			while (insertAt > 0 && active[insertAt - 1].index > item.index) {
				insertAt -= 1;
			}
			active.splice(insertAt, 0, item);
		}

		if (nextPos <= pos) {
			continue;
		}

		const currActive = active.slice();

		// Keep shared outer stack; close/open only where stacks differ.
		let shared = 0;
		while (
			shared < prevActive.length &&
			shared < currActive.length &&
			prevActive[shared].index === currActive[shared].index
		) {
			shared += 1;
		}

		for (let i = prevActive.length - 1; i >= shared; i--) {
			html += `</${prevActive[i].tag}>`;
		}

		for (let i = shared; i < currActive.length; i++) {
			html += `<${currActive[i].tag}>`;
		}

		html += escapeHTML(text.slice(pos, nextPos));
		prevActive = currActive;
	}

	for (let i = prevActive.length - 1; i >= 0; i--) {
		html += `</${prevActive[i].tag}>`;
	}

	return html;
}

function escapeHTML(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
