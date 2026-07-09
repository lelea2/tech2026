import {useMemo, useState} from 'react';
import './CalendarAvailabilityPicker.css';

function getDaysInMonth(year, month) {
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({length: days}, (_, i) => i + 1);
}

export default function CalendarAvailabilityPicker() {
  const today = new Date();
  const [selectedDates, setSelectedDates] = useState(new Set());

  const year = today.getFullYear();
  const month = today.getMonth();

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const toggleDate = (day) => {
    const key = `${year}-${month + 1}-${day}`;
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="availability-picker">
      <h3>Calendar Availability Picker</h3>
      <div className="grid">
        {days.map((day) => {
          const key = `${year}-${month + 1}-${day}`;
          const active = selectedDates.has(key);
          return (
            <button key={key} className={active ? 'active' : ''} onClick={() => toggleDate(day)}>
              {day}
            </button>
          );
        })}
      </div>
      <p>Selected: {selectedDates.size}</p>
    </div>
  );
}
