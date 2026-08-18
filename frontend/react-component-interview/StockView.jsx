import React, { useEffect, useMemo, useRef, useState } from "react";

const initialStocks = [
  { ticker: "AAPL", name: "Apple", price: 220, previousPrice: 220 },
  { ticker: "NVDA", name: "NVIDIA", price: 180, previousPrice: 180 },
  { ticker: "MSFT", name: "Microsoft", price: 510, previousPrice: 510 },
];

export default function StockTable() {
  const [stocks, setStocks] = useState(
    Object.fromEntries(
      initialStocks.map((stock) => [stock.ticker, stock])
    )
  );

  const [query, setQuery] = useState("");

  const pendingRef = useRef(new Map());
  const rafRef = useRef(null);

  useEffect(() => {
    const source = new EventSource("/api/stocks/stream");

    source.onmessage = (event) => {
      const update = JSON.parse(event.data);

      // Coalesce updates:
      // if NVDA updates 20 times before next frame,
      // only keep the latest value.
      pendingRef.current.set(
        update.ticker,
        update.price
      );

      if (rafRef.current !== null) {
        return;
      }

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        const updates = pendingRef.current;
        pendingRef.current = new Map();

        setStocks((prev) => {
          const next = { ...prev };

          for (const [ticker, price] of updates) {
            const stock = next[ticker];

            if (!stock) continue;

            next[ticker] = {
              ...stock,
              previousPrice: stock.price,
              price,
            };
          }

          return next;
        });
      });
    };

    return () => {
      source.close();

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const filteredStocks = useMemo(() => {
    const search = query.trim().toLowerCase();

    return Object.values(stocks).filter((stock) => {
      return (
        stock.ticker.toLowerCase().includes(search) ||
        stock.name.toLowerCase().includes(search)
      );
    });
  }, [stocks, query]);

  return (
    <div>
      <input
        value={query}
        placeholder="Search ticker or company"
        onChange={(e) => setQuery(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Company</th>
            <th>Price</th>
            <th>Change</th>
          </tr>
        </thead>

        <tbody>
          {filteredStocks.map((stock) => (
            <StockRow
              key={stock.ticker}
              stock={stock}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const StockRow = React.memo(function StockRow({ stock }) {
  const change =
    stock.price - stock.previousPrice;

  const percentChange =
    stock.previousPrice === 0
      ? 0
      : (change / stock.previousPrice) * 100;

  let direction = "—";

  if (change > 0) {
    direction = "▲";
  } else if (change < 0) {
    direction = "▼";
  }

  return (
    <tr>
      <td>
        <strong>{stock.ticker}</strong>
      </td>

      <td>{stock.name}</td>

      <td>
        ${stock.price.toFixed(2)}
      </td>

      <td>
        {direction}{" "}
        {percentChange.toFixed(2)}%
      </td>
    </tr>
  );
});