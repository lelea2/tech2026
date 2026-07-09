import {useState} from 'react';
import './FilterSidebar.css';

export default function FilterSidebar() {
  const [price, setPrice] = useState(200);
  const [instantBook, setInstantBook] = useState(false);
  const [roomType, setRoomType] = useState('any');

  return (
    <aside className="filter-sidebar">
      <h3>Filter Sidebar</h3>

      <label>
        Max price: ${price}
        <input
          type="range"
          min="50"
          max="500"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </label>

      <label className="row">
        <input
          type="checkbox"
          checked={instantBook}
          onChange={(e) => setInstantBook(e.target.checked)}
        />
        Instant book
      </label>

      <label>
        Room type
        <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
          <option value="any">Any</option>
          <option value="entire">Entire place</option>
          <option value="private">Private room</option>
          <option value="shared">Shared room</option>
        </select>
      </label>

      <pre>{JSON.stringify({price, instantBook, roomType}, null, 2)}</pre>
    </aside>
  );
}
