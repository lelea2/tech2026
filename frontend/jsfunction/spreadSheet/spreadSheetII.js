/**
 * Spreadsheet II: supports numeric literals and formulas with +, -, *, /.
 *
 * Formula rules:
 * - Evaluate strictly left-to-right (no operator precedence).
 * - Ignore spaces.
 * - Operands are cell references or numeric literals.
 * - Unset cells evaluate to 0.
 */
export default class Spreadsheet {
	constructor() {
		// Stores raw cell input: number literal or formula string.
		this.cells = new Map();
	}

	/**
	 * @param {string} cellId
	 * @param {number | string} input
	 * @returns {void}
	 */
	setCell(cellId, input) {
		this.cells.set(cellId, input);
	}

	/**
	 * @param {string} cellId
	 * @returns {number}
	 */
	getCell(cellId) {
		// New memo map per read to cache computed values in this evaluation pass.
		return this.#evaluateCell(cellId, new Map());
	}

	/**
	 * @param {string} cellId
	 * @param {Map<string, number>} memo
	 * @returns {number}
	 */
	#evaluateCell(cellId, memo) {
		// Reuse already computed values to avoid repeated recursion.
		if (memo.has(cellId)) {
			return memo.get(cellId);
		}

		const raw = this.cells.get(cellId);

		if (raw === undefined) {
			// Unset cells evaluate to zero.
			memo.set(cellId, 0);
			return 0;
		}

		if (typeof raw === 'number') {
			memo.set(cellId, raw);
			return raw;
		}

		if (!raw.startsWith('=')) {
			// Fallback for non-formula strings.
			const parsed = Number(raw);
			const value = Number.isNaN(parsed) ? 0 : parsed;
			memo.set(cellId, value);
			return value;
		}

		const expression = raw.slice(1).replace(/\s+/g, '');
		// Token order mirrors formula order; no precedence is applied.
		const tokens = expression.match(/[A-Z]+\d+|\d+(?:\.\d+)?|[+\-*/]/g) || [];

		// Evaluate strictly left-to-right.
		let result = this.#resolveOperand(tokens[0], memo);

		for (let i = 1; i < tokens.length; i += 2) {
			const operator = tokens[i];
			const rightValue = this.#resolveOperand(tokens[i + 1], memo);

			if (operator === '+') {
				result += rightValue;
			} else if (operator === '-') {
				result -= rightValue;
			} else if (operator === '*') {
				result *= rightValue;
			} else {
				result /= rightValue;
			}
		}

		memo.set(cellId, result);
		return result;
	}

	/**
	 * @param {string} token
	 * @param {Map<string, number>} memo
	 * @returns {number}
	 */
	#resolveOperand(token, memo) {
		// Operand can be a number literal...
		if (/^\d+(?:\.\d+)?$/.test(token)) {
			return Number(token);
		}

		// ...or a cell reference that may itself be a formula.
		return this.#evaluateCell(token, memo);
	}
}

/**
Example test cases:

test('supports subtraction and multiplication with left-to-right evaluation', () => {
	const sheet = new Spreadsheet();

	sheet.setCell('A1', 10);
	sheet.setCell('B1', '=A1 - 2 * 3');

	// Left-to-right: (10 - 2) * 3 = 24
	expect(sheet.getCell('B1')).toBe(24);
});

test('supports division and addition with left-to-right evaluation', () => {
	const sheet = new Spreadsheet();

	sheet.setCell('A1', 8);
	sheet.setCell('B1', '=A1 / 2 + 3');

	// Left-to-right: (8 / 2) + 3 = 7
	expect(sheet.getCell('B1')).toBe(7);
});

test('supports formula chaining across references', () => {
	const sheet = new Spreadsheet();

	sheet.setCell('A1', 4);
	sheet.setCell('B1', '=A1 + 6');
	sheet.setCell('C1', '=B1 * 2 - 3');

	// B1 = 10, then C1 = (10 * 2) - 3 = 17
	expect(sheet.getCell('C1')).toBe(17);
});
*/
