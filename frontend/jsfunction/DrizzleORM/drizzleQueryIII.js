export function integer(name) {
  return { kind: 'integer', name };
}

export function text(name) {
  return { kind: 'text', name };
}

export function table(name, columns) {
  const result = { _: { name } };

  for (const key of Object.keys(columns)) {
    result[key] = {
      kind: columns[key].kind,
      name: columns[key].name,
      tableName: name,
    };
  }

  return result;
}

function isColumn(value) {
  return value && typeof value === 'object' && 'tableName' in value;
}

function getColumnValue(context, column) {
  const row = context[column.tableName];

  if (row === null) {
    return null;
  }

  return row[column.name];
}

export function eq(left, right) {
  return function (context) {
    const leftValue = getColumnValue(context, left);
    const rightValue = isColumn(right)
      ? getColumnValue(context, right)
      : right;

    return leftValue === rightValue;
  };
}

export function and(...conditions) {
  return (context) => conditions.every((condition) => condition(context));
}

export function or(...conditions) {
  return (context) => conditions.some((condition) => condition(context));
}

export function asc(column) {
  return { column, direction: 'asc' };
}

export function desc(column) {
  return { column, direction: 'desc' };
}

export default function drizzle(data) {
  const clonedData = {};

  for (const tableName of Object.keys(data)) {
    clonedData[tableName] = data[tableName].map((row) => ({ ...row }));
  }

  return {
    select(selection) {
      return new QueryBuilder(clonedData, selection);
    },
  };
}

class QueryBuilder {
  constructor(data, selection) {
    this.data = data;
    this.selection = selection;

    this.baseTable = null;
    this.joins = [];
    this.condition = null;
    this.orderings = [];
    this.limitCount = null;
    this.offsetCount = 0;
  }

  from(table) {
    this.baseTable = table;
    return this;
  }

  innerJoin(table, on) {
    this.joins.push({ type: 'inner', table, on });
    return this;
  }

  leftJoin(table, on) {
    this.joins.push({ type: 'left', table, on });
    return this;
  }

  where(condition) {
    this.condition = condition;
    return this;
  }

  orderBy(...orderings) {
    this.orderings = orderings;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  offset(count) {
    this.offsetCount = count;
    return this;
  }

  all() {
    let contexts = this._createBaseContexts();

    for (const join of this.joins) {
      contexts = this._applyJoin(contexts, join);
    }

    if (this.condition) {
      contexts = contexts.filter((context) => this.condition(context));
    }

    if (this.orderings.length > 0) {
      contexts.sort((a, b) => this._compareContexts(a, b));
    }

    if (this.offsetCount > 0) {
      contexts = contexts.slice(this.offsetCount);
    }

    if (this.limitCount !== null) {
      contexts = contexts.slice(0, this.limitCount);
    }

    return contexts.map((context) => this._project(context));
  }

  _createBaseContexts() {
    const tableName = this.baseTable._.name;

    return this.data[tableName].map((row) => ({
      [tableName]: { ...row },
    }));
  }

  _applyJoin(contexts, join) {
    const tableName = join.table._.name;
    const joinedRows = this.data[tableName];
    const result = [];

    for (const context of contexts) {
      let matched = false;

      for (const row of joinedRows) {
        const nextContext = {
          ...context,
          [tableName]: { ...row },
        };

        if (join.on(nextContext)) {
          result.push(nextContext);
          matched = true;
        }
      }

      if (join.type === 'left' && !matched) {
        result.push({
          ...context,
          [tableName]: null,
        });
      }
    }

    return result;
  }

  _compareContexts(a, b) {
    for (const ordering of this.orderings) {
      const aValue = getColumnValue(a, ordering.column);
      const bValue = getColumnValue(b, ordering.column);

      if (aValue < bValue) {
        return ordering.direction === 'asc' ? -1 : 1;
      }

      if (aValue > bValue) {
        return ordering.direction === 'asc' ? 1 : -1;
      }
    }

    return 0;
  }

  _project(context) {
    if (this.selection) {
      const row = {};

      for (const key of Object.keys(this.selection)) {
        const column = this.selection[key];
        row[key] = getColumnValue(context, column);
      }

      return row;
    }

    // No projection + no joins: return full base row.
    if (this.joins.length === 0) {
      const tableName = this.baseTable._.name;
      return { ...context[tableName] };
    }

    // No projection + joins: return context keyed by table name.
    const result = {};

    for (const tableName of Object.keys(context)) {
      result[tableName] =
        context[tableName] === null
          ? null
          : { ...context[tableName] };
    }

    return result;
  }
}