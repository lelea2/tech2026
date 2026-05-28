import React, { useState } from 'react';

export function Tabs({ children }) {
  const tabs = React.Children.toArray(children);
  const [active, setActive] = useState(0);

  return (
    <div style={{ margin: '1rem 0' }}>
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #e5e7eb' }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: active === i ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: '-2px',
              fontWeight: active === i ? '600' : 'normal',
              color: active === i ? '#3b82f6' : 'inherit',
            }}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '1rem 0' }}>{tabs[active]}</div>
    </div>
  );
}

export function Tab({ children }) {
  return <div>{children}</div>;
}
