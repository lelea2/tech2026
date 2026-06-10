import { useEffect, useState } from "react";
import styles from "./JobBoard.module.css";

const JOB_IDS_URL = "https://hacker-news.firebaseio.com/v0/jobstories.json";
const ITEM_URL = "https://hacker-news.firebaseio.com/v0/item";

const INITIAL_COUNT = 9;
const LOAD_MORE_COUNT = 6;

function parseTitle(title) {
  // Most HN job titles are like:
  // "AcmeCo (YC W22) Is Hiring Frontend Engineers"
  const match = title.match(/^(.*?)\s+(is hiring|is looking for|hiring)\s*(.*)$/i);

  if (!match) {
    return {
      company: title,
      description: "Is hiring...",
    };
  }

  return {
    company: match[1].trim(),
    description: `${match[2]} ${match[3]}`.trim(),
  };
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString();
}

export default function JobBoard() {
  const [jobIds, setJobIds] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchJobBatch(startIndex, count) {
    setIsLoading(true);

    try {
      const idsToFetch = jobIds.slice(startIndex, startIndex + count);

      const jobRequests = idsToFetch.map(async (id) => {
        const response = await fetch(`${ITEM_URL}/${id}.json`);
        return response.json();
      });

      const newJobs = await Promise.all(jobRequests);

      setJobs((prev) => [...prev, ...newJobs.filter(Boolean)]);
      setVisibleCount((prev) => prev + newJobs.length);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function loadInitialJobs() {
      setIsLoading(true);

      try {
        const response = await fetch(JOB_IDS_URL);
        const ids = await response.json();

        setJobIds(ids);

        const firstNineIds = ids.slice(0, INITIAL_COUNT);

        const jobRequests = firstNineIds.map(async (id) => {
          const response = await fetch(`${ITEM_URL}/${id}.json`);
          return response.json();
        });

        const firstJobs = await Promise.all(jobRequests);

        setJobs(firstJobs.filter(Boolean));
        setVisibleCount(firstJobs.length);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialJobs();
  }, []);

  function handleLoadMore() {
    fetchJobBatch(visibleCount, LOAD_MORE_COUNT);
  }

  return (
    <main className="container">
      <h1 className="heading">Hacker News Jobs</h1>

      <section className="grid">
        {jobs.map((job) => {
          const parsed = parseTitle(job.title);

          const href =
            job.url ?? `https://news.ycombinator.com/item?id=${job.id}`;

          return (
            <a
              key={job.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
            >
              <h2 className="company">{parsed.company}</h2>

              <p className="description">{parsed.description}</p>

              <time className="date">{formatDate(job.time)}</time>
            </a>
          );
        })}
      </section>

      <button
        className="loadMore"
        onClick={handleLoadMore}
        disabled={isLoading || visibleCount >= jobIds.length}
      >
        {isLoading ? "Loading..." : "Load more"}
      </button>
    </main>
  );
}
