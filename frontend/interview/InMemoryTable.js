/**
 * In-memory table implementation.
 *
 * Supports:
 * - insertRow(row)
 * - deleteRow(rowId)
 * - updateCell(rowId, columnId, value)
 * - getCell(rowId, columnId)
 * - filterRows(predicate)
 * - sortRows(columnId)
 */

class InMemoryTable {
  constructor() {
    // Map<rowId, rowObject>
    this.rows = new Map();

    // Keeps insertion order of row IDs.
    this.rowOrder = [];
  }

  /**
   * Insert a new row.
   *
   * Example:
   * table.insertRow({ id: "r1", name: "Alice", age: 30 });
   */
  insertRow(row) {
    if (!row || row.id === undefined || row.id === null) {
      throw new Error("Row must have an id");
    }

    const rowId = row.id;

    if (this.rows.has(rowId)) {
      throw new Error(`Row with id ${rowId} already exists`);
    }

    // Store a copy to avoid external mutation.
    this.rows.set(rowId, { ...row });
    this.rowOrder.push(rowId);

    return this.rows.get(rowId);
  }

  /**
   * Delete a row by ID.
   *
   * Example:
   * table.deleteRow("r1");
   */
  deleteRow(rowId) {
    if (!this.rows.has(rowId)) {
      return false;
    }

    this.rows.delete(rowId);
    this.rowOrder = this.rowOrder.filter((id) => id !== rowId);

    return true;
  }

  /**
   * Update one cell.
   *
   * Example:
   * table.updateCell("r1", "age", 31);
   */
  updateCell(rowId, columnId, value) {
    if (!this.rows.has(rowId)) {
      throw new Error(`Row ${rowId} does not exist`);
    }

    const row = this.rows.get(rowId);

    const updatedRow = {
      ...row,
      [columnId]: value,
    };

    this.rows.set(rowId, updatedRow);

    return updatedRow;
  }

  /**
   * Get one cell value.
   *
   * Example:
   * table.getCell("r1", "name");
   */
  getCell(rowId, columnId) {
    if (!this.rows.has(rowId)) {
      return undefined;
    }

    return this.rows.get(rowId)[columnId];
  }

  /**
   * Return rows that match a predicate.
   *
   * Example:
   * table.filterRows(row => row.age >= 30);
   */
  filterRows(predicate) {
    const result = [];

    for (const rowId of this.rowOrder) {
      const row = this.rows.get(rowId);

      if (predicate(row)) {
        result.push({ ...row });
      }
    }

    return result;
  }

  /**
   * Sort rows by a column.
   *
   * Does not mutate the table.
   *
   * Example:
   * table.sortRows("age");
   */
  sortRows(columnId, direction = "asc") {
    const rows = this.rowOrder.map((rowId) => this.rows.get(rowId));

    const multiplier = direction === "desc" ? -1 : 1;

    return rows
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const valueA = a.row[columnId];
        const valueB = b.row[columnId];

        // Stable sorting fallback.
        if (valueA === valueB) {
          return a.index - b.index;
        }

        // Put undefined/null values at the end.
        if (valueA === undefined || valueA === null) return 1;
        if (valueB === undefined || valueB === null) return -1;

        // Number comparison.
        if (typeof valueA === "number" && typeof valueB === "number") {
          return (valueA - valueB) * multiplier;
        }

        // Boolean comparison.
        if (typeof valueA === "boolean" && typeof valueB === "boolean") {
          return (Number(valueA) - Number(valueB)) * multiplier;
        }

        // String / fallback comparison.
        return String(valueA).localeCompare(String(valueB)) * multiplier;
      })
      .map((item) => ({ ...item.row }));
  }

  /**
   * Optional helper: return all rows in insertion order.
   */
  getRows() {
    return this.rowOrder.map((rowId) => ({ ...this.rows.get(rowId) }));
  }
}