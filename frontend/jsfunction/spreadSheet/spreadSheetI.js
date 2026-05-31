/**
 * Tiny spreadsheet that supports numeric literals and formulas with + only.
 *
 * Cell value rules:
 * - number: treated as a literal.
 * - string starting with '=': formula, e.g. '=A1 + 5 + B2'.
 * - unset cell: behaves like 0.
 */
export default class Spreadsheet {
  constructor() {
    this.cells = new Map();
  }

  /**
	 * @param {string} cellId
	 * @param {number | string} value
	 * @returns {void}
	 */
  setCell(cellId, value) {
    this.cells.set(cellId, value);
  }

  /**
	 * @param {string} cellId
	 * @returns {number}
	 */
  getCell(cellId) {
    return this.#evaluateCell(cellId, new Map());
  }

  /**
	 * @param {string} cellId
	 * @param {Map<string, number>} memo
	 * @returns {number}
	 */
  #evaluateCell(cellId, memo) {
    if (memo.has(cellId)) {
      return memo.get(cellId);
    }

    const raw = this.cells.get(cellId);

    // Unset cells behave as zero.
    if (raw === undefined) {
      memo.set(cellId, 0);
      return 0;
    }

    // Number literal.
    if (typeof raw === 'number') {
      memo.set(cellId, raw);
      return raw;
    }

    // Non-formula string literal: parse as number fallback.
    if (!raw.startsWith('=')) {
      const parsed = Number(raw);
      const value = Number.isNaN(parsed) ? 0 : parsed;
      memo.set(cellId, value);
      return value;
    }

    // Formula supports + only.
    const expression = raw.slice(1);
    const parts = expression.split('+');
    let sum = 0;

    for (const part of parts) {
      const token = part.trim();

      // Numeric token in formula, e.g. '=A1 + 5'.
      // Formula left to right, supporting plus only
      if (/^-?\d+(?:\.\d+)?$/.test(token)) {
        sum += Number(token);
      } else {
        // Otherwise token is treated as a referenced cell id.
        sum += this.#evaluateCell(token, memo);
      }
    }

    memo.set(cellId, sum);
    return sum;
  }
}
