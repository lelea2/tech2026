import React from 'react';

const variants = {
  default:     { background: '#3b82f6', color: '#fff' },
  success:     { background: '#22c55e', color: '#fff' },
  warning:     { background: '#eab308', color: '#fff' },
  destructive: { background: '#ef4444', color: '#fff' },
  outline:     { background: 'transparent', color: 'inherit', border: '1px solid currentColor' },
};

export function Badge({ children, variant = 'default' }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.125rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      lineHeight: '1.25rem',
      ...(variants[variant] || variants.default),
    }}>
      {children}
    </span>
  );
}
