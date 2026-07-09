import {useState} from 'react';
import './TabsAria.css';

const TABS = [
  {id: 'overview', label: 'Overview', content: 'Listing highlights and neighborhood.'},
  {id: 'amenities', label: 'Amenities', content: 'Wifi, AC, kitchen, and workspace.'},
  {id: 'reviews', label: 'Reviews', content: '4.9 stars from 200+ guests.'},
];

export default function TabsAria({tabs = TABS}) {
  const [active, setActive] = useState(tabs[0].id);

  return (
    <div className="tabs-aria">
      <h3>Tabs with ARIA</h3>
      <div role="tablist" aria-label="Listing details">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={active === tab.id ? 'active' : ''}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
          className="panel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
