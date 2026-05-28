import React from 'react';

const styles = {
  insight: { background: 'var(--callout-insight-bg, #e8f4fd)', borderLeft: '4px solid #3b82f6' },
  warning: { background: 'var(--callout-warning-bg, #fef9c3)', borderLeft: '4px solid #eab308' },
  tip:     { background: 'var(--callout-tip-bg, #f0fdf4)',     borderLeft: '4px solid #22c55e' },
  info:    { background: 'var(--callout-info-bg, #f0f9ff)',    borderLeft: '4px solid #06b6d4' },
};

export function Callout({ type = 'info', children }) {
  const base = styles[type] || styles.info;
  return (
    <div style={{ ...base, padding: '0.875rem 1rem', borderRadius: '0 4px 4px 0', margin: '1rem 0' }}>
      {children}
    </div>
  );
}
