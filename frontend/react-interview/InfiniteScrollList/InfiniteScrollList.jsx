import {useEffect, useMemo, useRef, useState} from 'react';
import './InfiniteScrollList.css';

function makeItems(start, count) {
  return Array.from({length: count}, (_, i) => `Listing #${start + i}`);
}

export default function InfiniteScrollList() {
  const [items, setItems] = useState(() => makeItems(1, 20));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry.isIntersecting || loading) return;

      setLoading(true);
      setTimeout(() => {
        const nextPage = page + 1;
        setItems((prev) => [...prev, ...makeItems(nextPage * 20 - 19, 20)]);
        setPage(nextPage);
        setLoading(false);
      }, 500);
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [loading, page]);

  const count = useMemo(() => items.length, [items]);

  return (
    <div className="infinite-list">
      <h3>Infinite Scroll Listing</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div ref={sentinelRef} className="sentinel">
        {loading ? 'Loading more...' : `Loaded ${count} items`}
      </div>
    </div>
  );
}
