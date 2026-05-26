import React, { useState, useRef, useEffect } from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

function flattenItems(items, breadcrumb = []) {
  const results = [];
  for (const item of items) {
    if (item.type === 'category') {
      const crumb = [...breadcrumb, item.label];
      if (item.href) {
        results.push({ label: item.label, href: item.href, breadcrumb });
      }
      if (item.items?.length) {
        results.push(...flattenItems(item.items, crumb));
      }
    } else if (item.href) {
      results.push({ label: item.label, href: item.href, breadcrumb });
    }
  }
  return results;
}

function Highlighted({ text, query }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.highlight}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SidebarSearch({ sidebar }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const allItems = sidebar ? flattenItems(sidebar) : [];
  const q = query.trim().toLowerCase();
  const results = q
    ? allItems
        .filter(({ label, breadcrumb }) =>
          label.toLowerCase().includes(q) ||
          breadcrumb.some((b) => b.toLowerCase().includes(q))
        )
        .slice(0, 12)
    : [];

  useEffect(() => {
    function onPointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      <div className={styles.inputRow}>
        <svg className={styles.searchIcon} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
        <input
          className={styles.input}
          type="search"
          placeholder="Search navigation…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
              setQuery('');
            }
          }}
          aria-label="Search navigation"
          aria-expanded={open && results.length > 0}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
          autoComplete="off"
        />
      </div>

      {open && q && (
        <ul className={styles.dropdown} role="listbox" aria-label="Navigation search results">
          {results.length === 0 ? (
            <li className={styles.empty}>No results for &ldquo;{query}&rdquo;</li>
          ) : (
            results.map((item, i) => (
              <li key={i} role="option" aria-selected={false}>
                <Link
                  to={item.href}
                  className={styles.result}
                  onClick={() => {
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <span className={styles.resultLabel}>
                    <Highlighted text={item.label} query={query.trim()} />
                  </span>
                  {item.breadcrumb.length > 0 && (
                    <span className={styles.resultBreadcrumb}>
                      {item.breadcrumb.join(' › ')}
                    </span>
                  )}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
