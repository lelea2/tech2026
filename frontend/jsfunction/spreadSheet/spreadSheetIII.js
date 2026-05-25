/**
 * Spreadsheet III: supports numeric literals and formulas with +, -, *, /,
 * and detects direct/indirect/self cycles.
 *
 * If a cell is in a cycle, or depends on a cycle, getCell returns '#CYCLE!'.
 */
export default class Spreadsheet {
	constructor() {
		// Stores raw inputs (number or formula string) by cell id.
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
	 * @returns {number | '#CYCLE!'}
	 */
	getCell(cellId) {
		// Each read uses fresh memo/path so evaluation reflects current sheet state.
		return this.#evaluateCell(cellId, new Map(), new Set());
	}

	/**
	 * @param {string} cellId
	 * @param {Map<string, number | '#CYCLE!'>} memo
	 * @param {Set<string>} activePath
	 * @returns {number | '#CYCLE!'}
	 */
	#evaluateCell(cellId, memo, activePath) {
		// Reuse already-computed result in this evaluation pass.
		if (memo.has(cellId)) {
			return memo.get(cellId);
		}

		// Visiting the same cell again on current DFS path means a cycle.
		if (activePath.has(cellId)) {
			memo.set(cellId, '#CYCLE!');
			return '#CYCLE!';
		}

		// Mark cell as currently being evaluated.
		activePath.add(cellId);

		const raw = this.cells.get(cellId);

		if (raw === undefined) {
			// Unset cells behave as 0.
			memo.set(cellId, 0);
			activePath.delete(cellId);
			return 0;
		}

		if (typeof raw === 'number') {
			memo.set(cellId, raw);
			activePath.delete(cellId);
			return raw;
		}

		if (!raw.startsWith('=')) {
			// Fallback for non-formula strings; question guarantees valid inputs.
			const parsed = Number(raw);
			const value = Number.isNaN(parsed) ? 0 : parsed;
			memo.set(cellId, value);
			activePath.delete(cellId);
			return value;
		}

		// Tokenize formula and evaluate strictly left-to-right.
		const expression = raw.slice(1).replace(/\s+/g, '');
		const tokens = expression.match(/[A-Z]+\d+|\d+(?:\.\d+)?|[+\-*/]/g) || [];

		let result = this.#resolveOperand(tokens[0], memo, activePath);

		if (result === '#CYCLE!') {
			// Any cycle dependency makes the current cell a cycle result too.
			memo.set(cellId, '#CYCLE!');
			activePath.delete(cellId);
			return '#CYCLE!';
		}

		for (let i = 1; i < tokens.length; i += 2) {
			const operator = tokens[i];
			const rightValue = this.#resolveOperand(tokens[i + 1], memo, activePath);

			if (rightValue === '#CYCLE!') {
				// Propagate cycle through dependent formulas.
				memo.set(cellId, '#CYCLE!');
				activePath.delete(cellId);
				return '#CYCLE!';
			}

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
		// Done evaluating this branch.
		activePath.delete(cellId);
		return result;
	}

	/**
	 * @param {string} token
	 * @param {Map<string, number | '#CYCLE!'>} memo
	 * @param {Set<string>} activePath
	 * @returns {number | '#CYCLE!'}
	 */
	#resolveOperand(token, memo, activePath) {
		// Operands are either numeric literals or cell references.
		if (/^\d+(?:\.\d+)?$/.test(token)) {
			return Number(token);
		}

		return this.#evaluateCell(token, memo, activePath);
	}
}

/**
Test cases:

// 1) No cycle, left-to-right arithmetic.
const s1 = new Spreadsheet();
s1.setCell('A1', 10);
s1.setCell('B1', '=A1 - 2 * 3');
// (10 - 2) * 3 = 24
s1.getCell('B1'); // 24

// 2) Self-reference cycle.
const s2 = new Spreadsheet();
s2.setCell('A1', '=A1 + 1');
s2.getCell('A1'); // '#CYCLE!'

// 3) Direct cycle between two cells.
const s3 = new Spreadsheet();
s3.setCell('A1', '=B1 + 1');
s3.setCell('B1', '=A1 + 1');
s3.getCell('A1'); // '#CYCLE!'
s3.getCell('B1'); // '#CYCLE!'

// 4) Indirect cycle (A1 -> B1 -> C1 -> A1).
const s4 = new Spreadsheet();
s4.setCell('A1', '=B1 + 1');
s4.setCell('B1', '=C1 + 1');
s4.setCell('C1', '=A1 + 1');
s4.getCell('A1'); // '#CYCLE!'

// 5) Dependent on a cycle should also be cycle.
const s5 = new Spreadsheet();
s5.setCell('A1', '=B1 + 1');
s5.setCell('B1', '=B1 + 2');
s5.setCell('C1', '=A1 + 10');
s5.getCell('C1'); // '#CYCLE!'
*/
