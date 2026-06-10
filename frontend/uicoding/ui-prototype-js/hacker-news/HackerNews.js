import {useEffect, useState} from 'react';

const PAGE_SIZE = 5;
const JOB_ID_URLS = 'https://hacker-news.firebaseio.com/v0/jobstories.json';

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString();
}
export default function HackerNews() {
  const [jobIds, setJobIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);


  async function fetchJobIds() {
    const res = await fetch(JOB_ID_URLS);
    const data = await res.json(); // list of job uds;
    setJobIds(data); // do not change in pagination
    fetchJobs(data, 0); // start with first page
  }

  async function fetchJobs(jobIds, page) {
    setLoading(true);
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const jobPromises = jobIds.slice(start, end).map((id) => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((res) => res.json()));
    const jobData = await Promise.all(jobPromises);
    setJobs((prevJobs) => [...prevJobs, ...jobData]);
    setCurrentPage(page + 1);
    setLoading(false);
  }

  // inside a useEffect hook to prevent infinite re-renders and ensure it only runs when the component mounts.
  useEffect(() => {
    fetchJobIds();
  }, []);

  const hasMoreJob = jobIds.length > jobs.length;


  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="bg-orange-500 text-white font-bold text-xl px-3 py-2 mb-4 rounded">
        Hacker News
      </h1>
      <ul className="space-y-4">
        {jobs.map((job) => (
          <li key={job.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
              {job.url ? (
                <a href={job.url} target="_blank" rel="noreferrer" className="hover:underline text-blue-700 dark:text-blue-400">
                  {job.title}
                </a>
              ) : (
                job.title
              )}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Posted by {job.by} · {formatDate(job.time)}
            </p>
          </li>
        ))}
      </ul>
      {loading && <p className="text-gray-500 dark:text-gray-400 mt-4">Loading...</p>}
      {!loading && hasMoreJob && (
        <button
          onClick={() => fetchJobs(jobIds, currentPage)}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          Load more
        </button>
      )}
    </main>
  );
}
