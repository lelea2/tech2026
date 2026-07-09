import {useState} from 'react';
import './ReservationForm.css';

export default function ReservationForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    checkIn: '',
    checkOut: '',
  });
  const [errors, setErrors] = useState({});

  const onChange = (key, value) => setForm((prev) => ({...prev, [key]: value}));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.includes('@')) next.email = 'Valid email is required';
    if (!form.checkIn) next.checkIn = 'Check-in is required';
    if (!form.checkOut) next.checkOut = 'Check-out is required';
    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) {
      next.checkOut = 'Check-out must be after check-in';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      alert('Reservation submitted');
    }
  };

  return (
    <form className="reservation-form" onSubmit={onSubmit}>
      <h3>Reservation Form</h3>
      <label>
        Name
        <input value={form.name} onChange={(e) => onChange('name', e.target.value)} />
        {errors.name && <small>{errors.name}</small>}
      </label>

      <label>
        Email
        <input value={form.email} onChange={(e) => onChange('email', e.target.value)} />
        {errors.email && <small>{errors.email}</small>}
      </label>

      <label>
        Check-in
        <input type="date" value={form.checkIn} onChange={(e) => onChange('checkIn', e.target.value)} />
        {errors.checkIn && <small>{errors.checkIn}</small>}
      </label>

      <label>
        Check-out
        <input type="date" value={form.checkOut} onChange={(e) => onChange('checkOut', e.target.value)} />
        {errors.checkOut && <small>{errors.checkOut}</small>}
      </label>

      <button type="submit">Reserve</button>
    </form>
  );
}
