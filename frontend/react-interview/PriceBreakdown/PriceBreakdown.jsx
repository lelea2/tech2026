import {useMemo, useState} from 'react';
import './PriceBreakdown.css';

export default function PriceBreakdown() {
  const [nights, setNights] = useState(3);
  const basePrice = 120;
  const cleaningFee = 45;
  const serviceFee = 28;

  const total = useMemo(
    () => nights * basePrice + cleaningFee + serviceFee,
    [nights, basePrice, cleaningFee, serviceFee],
  );

  return (
    <div className="price-breakdown">
      <h3>Price Breakdown</h3>
      <label>
        Nights
        <input
          type="number"
          min="1"
          value={nights}
          onChange={(e) => setNights(Math.max(1, Number(e.target.value) || 1))}
        />
      </label>
      <ul>
        <li>${basePrice} x {nights} nights: ${basePrice * nights}</li>
        <li>Cleaning fee: ${cleaningFee}</li>
        <li>Service fee: ${serviceFee}</li>
      </ul>
      <p className="total">Total: ${total}</p>
    </div>
  );
}
