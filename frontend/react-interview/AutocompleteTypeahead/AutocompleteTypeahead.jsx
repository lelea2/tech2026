import {useMemo, useState} from 'react';
import './AutocompleteTypeahead.css';

const DEFAULT_ITEMS = [
  'San Francisco',
  'San Jose',
  'San Diego',
  'Seattle',
  'New York',
  'Boston',
  'Austin',
  'Chicago',
  'Los Angeles',
  'Denver',
];

export default function AutocompleteTypeahead({items = DEFAULT_ITEMS}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(q)).slice(0, 6);
  }, [items, query]);

  const onKeyDown = (event) => {
    if (!filtered.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      setQuery(filtered[activeIndex]);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="auto-card">
      <h3>Autocomplete / Typeahead</h3>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={onKeyDown}
        placeholder="Search city"
      />

      {filtered.length > 0 && (
        <ul className="auto-list">
          {filtered.map((item, index) => (
            <li
              key={item}
              className={activeIndex === index ? 'active' : ''}
              onMouseDown={() => setQuery(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
