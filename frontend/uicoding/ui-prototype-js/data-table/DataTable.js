import { useMemo, useState } from 'react';
import styles from './DataTable.module.css';

function sortData(data, columns, field, direction) {
  const dataClone = data.slice();
  const comparator = columns.find((column) => column.key === field)?.comparator;

  if (!comparator) return dataClone;

  return dataClone.sort((a, b) => comparator(a, b, direction));
}

function filterData(data, columns, filters) {
  return data.filter((row) => {
    return columns.every((column) => {
      if (!column.filter) return true;

      const filterValue = filters[column.key];
      if (!filterValue) return true;

      if (column.filter.type === 'text' && filterValue.type === 'text') {
        const search = filterValue.value.trim().toLowerCase();

        // Empty text filter is ignored.
        if (!search) return true;

        return column.filter
          .getValue(row)
          .toLowerCase()
          .includes(search);
      }

      if (column.filter.type === 'range' && filterValue.type === 'range') {
        const min = Number(filterValue.min);
        const max = Number(filterValue.max);
        const value = column.filter.getValue(row);

        const hasValidMin = filterValue.min.trim() !== '' && !Number.isNaN(min);
        const hasValidMax = filterValue.max.trim() !== '' && !Number.isNaN(max);

        // Empty or invalid inputs are ignored.
        if (hasValidMin && value < min) return false;
        if (hasValidMax && value > max) return false;

        return true;
      }

      return true;
    });
  });
}

function paginateData(data, page, pageSize) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    pageData: data.slice(start, end),
    maxPages: Math.ceil(data.length / pageSize),
  };
}

export default function DataTable({ data, columns }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});

  const filteredData = useMemo(
    () => filterData(data, columns, filters),
    [data, columns, filters],
  );

  const sortedData = useMemo(
    () => sortData(filteredData, columns, sortField, sortDirection),
    [filteredData, columns, sortField, sortDirection],
  );

  const { pageData, maxPages } = paginateData(sortedData, page, pageSize);

  function updateTextFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: {
        type: 'text',
        value,
      },
    }));
    setPage(1);
  }

  function updateRangeFilter(key, field, value) {
    setFilters((current) => {
      const existing = current[key];

      const previous =
        existing?.type === 'range'
          ? existing
          : {
              type: 'range',
              min: '',
              max: '',
            };

      return {
        ...current,
        [key]: {
          ...previous,
          [field]: value,
        },
      };
    });

    setPage(1);
  }

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => {
              const filterValue = filters[column.key];

              return (
                <th key={column.key}>
                  <button
                    className="sortButton"
                    onClick={() => {
                      if (sortField !== column.key) {
                        setSortField(column.key);
                        setSortDirection('asc');
                      } else {
                        setSortDirection((current) =>
                          current === 'asc' ? 'desc' : 'asc',
                        );
                      }

                      setPage(1);
                    }}
                  >
                    {column.label}
                    {sortField === column.key
                      ? sortDirection === 'asc'
                        ? ' ↑'
                        : ' ↓'
                      : ''}
                  </button>

                  {column.filter?.type === 'text' && (
                    <input
                      className="filterInput"
                      aria-label={`Filter ${column.label}`}
                      value={filterValue?.type === 'text' ? filterValue.value : ''}
                      onChange={(event) =>
                        updateTextFilter(column.key, event.target.value)
                      }
                      placeholder="Search..."
                    />
                  )}

                  {column.filter?.type === 'range' && (
                    <div className="rangeFilter">
                      <input
                        className="filterInput"
                        aria-label={`Min ${column.label}`}
                        value={filterValue?.type === 'range' ? filterValue.min : ''}
                        onChange={(event) =>
                          updateRangeFilter(column.key, 'min', event.target.value)
                        }
                        placeholder="Min"
                      />
                      <input
                        className="filterInput"
                        aria-label={`Max ${column.label}`}
                        value={filterValue?.type === 'range' ? filterValue.max : ''}
                        onChange={(event) =>
                          updateRangeFilter(column.key, 'max', event.target.value)
                        }
                        placeholder="Max"
                      />
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {pageData.map((item) => (
            <tr key={item.id}>
              {columns.map(({ key, renderCell }) => (
                <td key={key}>{renderCell(item)}</td>
              ))}
            </tr>
          ))}

          {pageData.length === 0 && (
            <tr>
              <td colSpan={columns.length}>No results</td>
            </tr>
          )}
        </tbody>
      </table>

      <hr />

      <div className="pagination">
        <select
          aria-label="Page size"
          value={pageSize}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
        >
          {[5, 10, 20].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>

        <div className="pages">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>

          <span aria-label="Page number">
            {maxPages === 0 ? '0 pages' : `Page ${page} of ${maxPages}`}
          </span>

          <button
            disabled={maxPages === 0 || page === maxPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
