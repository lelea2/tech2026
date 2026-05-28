import React from 'react';

export function Steps({ children }) {
  const items = React.Children.toArray(children);
  return (
    <div style={{ margin: '1rem 0' }}>
      {items.map((child, i) => React.cloneElement(child, { stepNumber: i + 1 }))}
    </div>
  );
}

export function Step({ title, children, stepNumber }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
      <div style={{
        flexShrink: 0, width: '2rem', height: '2rem',
        borderRadius: '50%', background: '#3b82f6', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '700', fontSize: '0.875rem',
      }}>
        {stepNumber}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <p style={{ fontWeight: '700', marginTop: '0.25rem', marginBottom: '0.5rem' }}>{title}</p>}
        {children}
      </div>
    </div>
  );
}
