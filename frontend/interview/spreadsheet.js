function isRowVisibleForFilters(row, filterSet) {
  const { conjunction, filters } = filterSet;
  if (conjunction !== "and" && conjunction !== "or") {
    throw new Error(`Unsupported conjunction: ${conjunction}`);
  }
  const results = filters.map((filter) => matchesFilter(row, filter));
  if (conjunction === "and") {
    return results.every(Boolean);
  }
  return results.some(Boolean);
}
function matchesFilter(row, filter) {
  const cell = row[filter.columnIndex];
  // Missing column should not match.
  if (!cell) return false;
  // Filter type must match cell type.
  if (cell.dataType !== filter.dataType) return false;
  if (filter.dataType === "string") {
    return matchesStringFilter(cell, filter);
  }
  if (filter.dataType === "select") {
    return matchesSelectFilter(cell, filter);
  }
  throw new Error(`Unsupported dataType: ${filter.dataType}`);
}

function matchesStringFilter(cell, filter) {
  switch (filter.operator) {
    case "=":
      return cell.value === filter.operand;
    case "!=":
      return cell.value !== filter.operand;
    default:
      throw new Error(`Unsupported string operator: ${filter.operator}`);
  }
}

function matchesSelectFilter(cell, filter) {
  const cellId = cell.value.id;
  switch (filter.operator) {
    case "=":
      return cellId === filter.operand.id;
    case "isOneOf":
      return filter.operand.some((option) => option.id === cellId);
    default:
      throw new Error(`Unsupported select operator: ${filter.operator}`);
  }
}