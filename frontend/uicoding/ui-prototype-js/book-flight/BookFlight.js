import { useState } from "react";

export default function App() {
  const [tripType, setTripType] = useState("one_way");
  const [dates, setDates] = useState({
    departure: "",
    returnDate: "",
  });

  const handleDateChange = (field, value) => {
    setDates((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!dates.departure) {
      alert("Please select a departure date.");
      return;
    }

    if (tripType === "round_trip" && !dates.returnDate) {
      alert("Please select a return date.");
      return;
    }

    if (tripType === "one_way") {
      alert(`You booked a one-way flight on ${dates.departure}`);
    } else {
      alert(
        `You booked a round-trip flight departing on ${dates.departure} and returning on ${dates.returnDate}`
      );
    }
  };

  const fieldClass = "w-full px-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded focus:outline-none focus:border-orange-500 text-white";
  const labelClass = "block text-xs text-slate-400 uppercase tracking-wide mb-1";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="tripType" className={labelClass}>Trip type</label>
        <select
          id="tripType"
          value={tripType}
          onChange={(e) => setTripType(e.target.value)}
          className={fieldClass}
        >
          <option value="one_way">One-way flight</option>
          <option value="round_trip">Round-trip flight</option>
        </select>
      </div>

      <div>
        <label htmlFor="departure" className={labelClass}>Departure date</label>
        <input
          id="departure"
          type="date"
          value={dates.departure}
          onChange={(e) => handleDateChange("departure", e.target.value)}
          className={fieldClass}
        />
      </div>

      {tripType === "round_trip" && (
        <div>
          <label htmlFor="returnDate" className={labelClass}>Return date</label>
          <input
            id="returnDate"
            type="date"
            value={dates.returnDate}
            onChange={(e) => handleDateChange("returnDate", e.target.value)}
            className={fieldClass}
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
      >
        Book Flight
      </button>
    </form>
  );
}
