import {useState} from 'react';
import './MapListingSync.css';

const LISTINGS = [
  {id: 1, title: 'Downtown Loft', area: 'North'},
  {id: 2, title: 'Parkside Studio', area: 'East'},
  {id: 3, title: 'Beach House', area: 'West'},
  {id: 4, title: 'Mountain Cabin', area: 'South'},
];

export default function MapListingSync() {
  const [activeId, setActiveId] = useState(LISTINGS[0].id);

  return (
    <div className="map-sync">
      <h3>Map + Listing Sync</h3>
      <div className="layout">
        <div className="list">
          {LISTINGS.map((item) => (
            <button
              key={item.id}
              className={activeId === item.id ? 'active' : ''}
              onClick={() => setActiveId(item.id)}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="map">
          <p>Mock map region</p>
          <div className="markers">
            {LISTINGS.map((item) => (
              <button
                key={item.id}
                className={activeId === item.id ? 'active' : ''}
                onClick={() => setActiveId(item.id)}
              >
                {item.area}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
