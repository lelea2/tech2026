import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import "./InfiniteScroll.css";

const JOB_STORIES_URL = 'https://hacker-news.firebaseio.com/v0/jobstories.json';
const ITEM_URL = 'https://hacker-news.firebaseio.com/v0/item';

const PAGE_SIZE = 9;

export default function JobBoard() {
  /**
   * jobIds:
   * The full list of latest Hacker News job post IDs.
   *
   * jobs:
   * The actual hydrated job post objects that we render.
   *
   * currentIndex:
   * Tracks how many IDs we have already attempted to fetch.
   */
  const [jobIds, setJobIds] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  /**
   * fetchedIdsRef:
   * Used for deduping.
   *
   * Even if loadMore gets triggered multiple times by button clicks,
   * IntersectionObserver, or React re-renders, this prevents us from
   * adding the same job twice.
   */
  const fetchedIdsRef = useRef(new Set());

  /**
   * isFetchingRef:
   * Prevents overlapping requests.
   *
   * This is important because infinite scroll can trigger quickly,
   * especially when the sentinel is already visible.
   */
  const isFetchingRef = useRef(false);

  /**
   * sentinelRef:
   * This is the DOM element observed by IntersectionObserver.
   * When it becomes visible, we load more jobs.
   */
  const sentinelRef = useRef(null);

  const hasMore = currentIndex < jobIds.length;

  /**
   * Step 1:
   * Fetch the list of latest job IDs once on mount.
   */
  useEffect(() => {
    async function fetchJobIds() {
      try {
        setLoadingInitial(true);
        setError(null);

        const response = await fetch(JOB_STORIES_URL);

        if (!response.ok) {
          throw new Error('Failed to fetch job IDs');
        }

        const ids = await response.json();

        setJobIds(ids);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoadingInitial(false);
      }
    }

    fetchJobIds();
  }, []);

  /**
   * Fetch a single job post by ID.
   */
  async function fetchJobPost(id) {
    const response = await fetch(`${ITEM_URL}/${id}.json`);

    if (!response.ok) {
      return null;
    }

    const post = await response.json();

    /**
     * Hacker News items can occasionally be deleted or missing.
     * We only want valid job posts with a title.
     */
    if (!post || !post.title) {
      return null;
    }

    return {
      id: post.id,
      title: post.title,
      url: post.url,
      time: post.time,
      by: post.by,
    };
  }

  /**
   * Step 2:
   * Load the next page of job posts.
   *
   * Interview explanation:
   * - Take the next PAGE_SIZE IDs.
   * - Fetch their metadata in parallel using Promise.all.
   * - Filter out invalid/null posts.
   * - Deduplicate by ID before adding to state.
   * - Advance currentIndex so the next call fetches the next batch.
   */
  const loadMore = useCallback(async () => {
    if (isFetchingRef.current) return;
    if (currentIndex >= jobIds.length) return;

    try {
      isFetchingRef.current = true;
      setLoadingMore(true);
      setError(null);

      const nextIds = jobIds.slice(currentIndex, currentIndex + PAGE_SIZE);

      const posts = await Promise.all(nextIds.map(fetchJobPost));

      const validPosts = posts.filter((post) => {
        if (!post) return false;

        /**
         * Deduping:
         * If we have already fetched this ID, skip it.
         */
        if (fetchedIdsRef.current.has(post.id)) {
          return false;
        }

        fetchedIdsRef.current.add(post.id);
        return true;
      });

      setJobs((prevJobs) => [...prevJobs, ...validPosts]);
      setCurrentIndex((prevIndex) => prevIndex + PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [currentIndex, jobIds]);

  /**
   * Step 3:
   * Once job IDs are loaded, fetch the first page automatically.
   */
  useEffect(() => {
    if (jobIds.length === 0) return;
    if (jobs.length > 0) return;

    loadMore();
  }, [jobIds, jobs.length, loadMore]);

  /**
   * Step 4:
   * Infinite scroll using IntersectionObserver.
   *
   * Interview explanation:
   * - We observe a small sentinel div at the bottom of the list.
   * - When it enters the viewport, we call loadMore().
   * - This is more efficient than listening to every scroll event.
   */
  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry.isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [hasMore, loadingMore, loadMore]);

  /**
   * Step 5:
   * Throttled scroll listener.
   *
   * In this implementation, IntersectionObserver does the actual loading.
   * The throttled scroll handler is useful for scroll-based UI behavior,
   * analytics, sticky headers, or fallback logic.
   *
   * We keep it here because the requirement specifically asks to layer on
   * throttling on scroll.
   */
  useEffect(() => {
    let lastRun = 0;
    const THROTTLE_MS = 300;

    function onScroll() {
      const now = Date.now();

      if (now - lastRun < THROTTLE_MS) {
        return;
      }

      lastRun = now;

      /**
       * Example scroll-related work:
       * We could update a sticky header, show a "back to top" button,
       * or collect lightweight analytics.
       *
       * We intentionally do not call loadMore here because
       * IntersectionObserver already handles that more efficiently.
       */
      const scrollY = window.scrollY;

      // Placeholder for interview demonstration.
      // console.log('Throttled scroll position:', scrollY);
      void scrollY;
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const renderedJobs = useMemo(() => {
    return jobs.map((job) => <JobCard key={job.id} job={job} />);
  }, [jobs]);

  if (loadingInitial) {
    return <p>Loading jobs...</p>;
  }

  return (
    <main className="job-board">
      <header className="job-board__header">
        <h1>Hacker News Job Board</h1>
        <p>Latest job posts from Hacker News.</p>
      </header>

      {error && <p className="job-board__error">{error}</p>}

      <section className="job-board__list" aria-label="Job posts">
        {renderedJobs}
      </section>

      <div className="job-board__actions">
        {hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="job-board__button"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        ) : (
          <p>No more jobs to load.</p>
        )}
      </div>

      {/*
        Sentinel for infinite scroll.
        When this div enters the viewport, IntersectionObserver loads more.
      */}
      <div ref={sentinelRef} className="job-board__sentinel" />
    </main>
  );
}

function JobCard({ job }) {
  const jobUrl = job.url ?? `https://news.ycombinator.com/item?id=${job.id}`;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(job.time * 1000));

  const companyName = parseCompanyName(job.title);

  return (
    <article className="job-card">
      <a
        href={jobUrl}
        target="_blank"
        rel="noreferrer"
        className="job-card__link"
      >
        <h2 className="job-card__company">{companyName}</h2>
        <p className="job-card__title">{job.title}</p>
        <p className="job-card__date">{formattedDate}</p>
      </a>
    </article>
  );
}

/**
 * Basic parser for Hacker News job titles.
 *
 * Many HN job titles look like:
 * "Company | Role | Location"
 *
 * This parser extracts the first section as the company name.
 */
function parseCompanyName(title) {
  return title.split('|')[0].trim();
}
