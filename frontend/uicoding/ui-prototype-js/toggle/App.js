import { useState } from 'react';
import { Toggle } from './Toggle';

export default function App() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 16, padding: 24 }}>
      <Toggle
        label="Enable notifications"
        checked={enabled}
        onChange={setEnabled}
        showLabel
      />

      <Toggle
        label="Small toggle"
        size="small"
        defaultChecked
        showLabel
      />

      <Toggle
        label="Disabled toggle"
        disabled
        showLabel
      />
    </div>
  );
}
