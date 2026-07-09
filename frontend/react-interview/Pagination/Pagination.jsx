import {useMemo, useState} from 'react';
import './Pagination.css';

export default function Pagination() {
  const pageSize = 10;
  const totalItems = 95;
  const totalPages = Math.ceil(totalItems / pageSize);
  const [page, setPage] = useState(1);

  const visible = useMemo(() => {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(totalItems, page * pageSize);
    return {start, end};
  }, [page]);

  return (
    <div className="pagination-demo">
      <h3>Pagination</h3>
      <p>
        Showing {visible.start}-{visible.end} of {totalItems}
      </p>
      <div className="controls">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
