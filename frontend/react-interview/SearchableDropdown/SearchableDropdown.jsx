import {useMemo, useState} from 'react';
import './SearchableDropdown.css';

const OPTIONS = [
  'Apartment',
  'House',
  'Cabin',
  'Loft',
  'Villa',
  'Condo',
  'Studio',
  'Townhome',
];

export default function SearchableDropdown({options = OPTIONS}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('Choose property type');
  const [highlighted, setHighlighted] = useState(0);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [options, query]);

  const onKeyDown = (event) => {
    if (!open) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((prev) => (prev + 1) % Math.max(filtered.length, 1));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
    }

    if (event.key === 'Enter' && filtered[highlighted]) {
      setSelected(filtered[highlighted]);
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="dropdown-card" onKeyDown={onKeyDown}>
      <h3>Searchable Dropdown</h3>
      <button className="dropdown-trigger" onClick={() => setOpen((v) => !v)}>
        {selected}
      </button>

      {open && (
        <div className="dropdown-panel">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlighted(0);
            }}
            placeholder="Search options"
          />
          <ul>
            {filtered.map((option, index) => (
              <li
                key={option}
                className={highlighted === index ? 'active' : ''}
                onMouseDown={() => {
                  setSelected(option);
                  setOpen(false);
                  setQuery('');
                }}
              >
                {option}
              </li>
            ))}
            {!filtered.length && <li className="empty">No matches</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
