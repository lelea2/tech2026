/**
 * @param {Document} document
 * @param {string} hierarchy
 * @return {Array<Element>}
 */
export default function getElementsByTagNameHierarchy(document, hierarchy) {
	// Normalize input like "DIV   span" -> ["div", "span"].
	const tags = hierarchy
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((tag) => tag.toLowerCase());

	if (tags.length === 0) {
		return [];
	}

	/**
	 * Returns descendants of root that match tag (root itself is excluded).
	 * @param {Document | Element} root
	 * @param {string} tag
	 * @return {Array<Element>}
	 */
	function findMatchingDescendants(root, tag) {
		const results = [];

		// DFS through descendants (excluding root) and collect tag matches.
		function traverse(node) {
			if (!node || !node.children) {
				return;
			}

			for (const child of node.children) {
				if (tag === '*' || child.tagName.toLowerCase() === tag) {
					results.push(child);
				}
				traverse(child);
			}
		}

		traverse(root);
		return results;
	}

	let currentLevel = [document];

	/*
	Hierarchy flow example for "div span a":
	[document] --find div descendants--> [all matching divs]
	[matching divs] --find span descendants--> [all matching spans]
	[matching spans] --find a descendants--> [all matching anchors]
	*/
	// Apply each hierarchy tag step-by-step (descendant combinator behavior).
	for (const tag of tags) {
		const nextLevel = [];
		const seen = new Set();

		// For each currently matched ancestor root, find descendants matching this tag
		// and collect unique matches as candidates for the next hierarchy step.
		for (const root of currentLevel) {
			for (const match of findMatchingDescendants(root, tag)) {
				if (!seen.has(match)) {
					seen.add(match);
					nextLevel.push(match);
				}
			}
		}

		currentLevel = nextLevel;
		// Early exit: once no nodes match at a step, no later step can match either.
		if (currentLevel.length === 0) {
			break;
		}
	}

	return currentLevel;
}
