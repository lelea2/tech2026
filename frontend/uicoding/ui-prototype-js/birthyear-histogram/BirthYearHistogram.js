import { useEffect, useState } from "react";
import "./styles.css";

const API_URL =
  "https://www.random.org/integers/?num=200&min=1950&max=2019&col=1&base=10&format=plain&rnd=new";

const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010];

/**
 * Buckets an array of years into decades.
 * @param years
 * @returns
 */
function bucketByDecade(years) {
  const buckets = {};

  for (const decade of DECADES) {
    buckets[decade] = 0;
  }

  for (const year of years) {
    const decade = Math.floor(year / 10) * 10;
    buckets[decade]++;
  }

  return DECADES.map((decade) => ({
    decade,
    label: `${decade}s`,
    count: buckets[decade],
  }));
}

export default function BirthYearHistogram() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function fetchBirthYears() {
      try {
        setStatus("loading");

        const res = await fetch(API_URL);
        const text = await res.text();

        const years = text
          .trim()
          .split("\n")
          .map(Number)
          .filter((year) => !Number.isNaN(year));

        setData(bucketByDecade(years)); // bucket number to decades
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }

    fetchBirthYears();
  }, []);

  if (status === "loading") return <p>Loading histogram...</p>;
  if (status === "error") return <p>Failed to load data.</p>;

  const maxCount = Math.max(...data.map((item) => item.count));

  return (
    <div className="histogram">
      <h2>Birth Year Histogram</h2>

      <div className="chart" aria-label="Birth year histogram">
        <div className="y-axis-label">Count</div>

        <div className="bars">
          {data.map((item) => {
            const height = `${(item.count / maxCount) * 100}%`;

            return (
              <div className="bar-group" key={item.decade}>
                <div className="bar-wrapper">
                  <div
                    className="bar"
                    style={{ height }}
                    title={`${item.label}: ${item.count}`}
                  />
                </div>

                <div className="count">{item.count}</div>
                <div className="x-label">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
