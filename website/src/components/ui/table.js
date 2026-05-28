import React from 'react';

const cellStyle = { padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' };
const headStyle = { padding: '0.5rem 0.75rem', borderBottom: '2px solid #e5e7eb', textAlign: 'left', fontWeight: '700' };

export function Table({ children }) {
  return <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>{children}</table>;
}
export function Thead({ children }) { return <thead>{children}</thead>; }
export function Tbody({ children }) { return <tbody>{children}</tbody>; }
export function Tr({ children })    { return <tr>{children}</tr>; }
export function Th({ children })    { return <th style={headStyle}>{children}</th>; }
export function Td({ children })    { return <td style={cellStyle}>{children}</td>; }
