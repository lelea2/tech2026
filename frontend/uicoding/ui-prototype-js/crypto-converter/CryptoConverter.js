import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CryptoConverter.module.css";

const SUPPORTED_CURRENCIES = ["usd", "eur", "gbp", "jpy", "cad", "aud"];

const REFRESH_INTERVAL_MS = 10_000;

export default function CryptoConverter() {
  const [amount, setAmount] = useState("1");
  const [currency, setCurrency] = useState("usd");

  const [rate, setRate] = useState(null);
  const [previousRate, setPreviousRate] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Clean up the interval and abort the fetch request when the component unmounts.
  // abort the fetch request if it's still in progress.
  // We use AbortController to cancel an in-flight fetch request when a newer request replaces it or when the component unmounts.
  const abortControllerRef = useRef(null);

  /**
   * Fetch the current exchange rate for the given currency.
   */
  async function fetchRate(code) {
    // Without AbortController, an old request could finish after a newer request and overwrite the latest state.
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `https://api.frontendeval.com/fake/crypto/${code}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error("Unsupported currency or API error");
      }

      const data = await response.json();

      setRate((currentRate) => {
        setPreviousRate(currentRate);
        return data.value;
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setError("Could not fetch conversion rate.");
      setRate(null);
      setPreviousRate(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchRate(currency);

    const intervalId = window.setInterval(() => {
      fetchRate(currency);
    }, REFRESH_INTERVAL_MS);

    // Clean up the interval and abort the fetch request when the component unmounts.
    return () => {
      window.clearInterval(intervalId);
      abortControllerRef.current?.abort();
    };
  }, [currency]);

  const convertedAmount = useMemo(() => {
    const numericAmount = Number(amount);

    if (rate == null || Number.isNaN(numericAmount)) {
      return null;
    }

    return numericAmount / rate;
  }, [amount, rate]);

  const direction = useMemo(() => {
    if (rate == null || previousRate == null) {
      return null;
    }

    if (rate > previousRate) return "up";
    if (rate < previousRate) return "down";

    return "same";
  }, [rate, previousRate]);

  return (
    <main className="container">
      <h1 className="title">WUC Crypto Converter</h1>

      <div className="form">
        <label className="field">
          <span className="labelText">Amount</span>

          <input
            className="input"
            type="number"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount"
          />
        </label>

        <label className="field">
          <span className="labelText">Currency</span>

          <select
            className="select"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          >
            {SUPPORTED_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="result">
        {isLoading && <p className="loading">Refreshing price...</p>}

        {error && <p className="error">{error}</p>}

        {!error && convertedAmount != null && (
          <>
            <p className="converted">
              {convertedAmount.toFixed(6)} WUC
              <PriceChange direction={direction} />
            </p>

            <p className="rate">
              1 WUC = {rate?.toFixed(6)} {currency.toUpperCase()}
            </p>
          </>
        )}
      </section>
    </main>
  );
}

function PriceChange({ direction }) {
  if (direction == null || direction === "same") {
    return <span className="priceChangeNeutral">—</span>;
  }

  if (direction === "up") {
    return <span className="priceChangeUp">↑</span>;
  }

  return <span className="priceChangeDown">↓</span>;
}
