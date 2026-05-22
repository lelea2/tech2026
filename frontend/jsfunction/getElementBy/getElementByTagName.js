/**
 * @param {Element} element
 * @param {string} tagName
 * @return {Array<Element>}
 */
export default function getElementsByTagName(element, tagName) {
	const results = [];
	const normalizedTag = tagName.toLowerCase();

	function traverse(node) {
		if (!node || !node.children) {
			return;
		}

		for (const child of node.children) {
			if (normalizedTag === '*' || child.tagName.toLowerCase() === normalizedTag) {
				results.push(child);
			}
			traverse(child);
		}
	}

	traverse(element);
	return results;
}
