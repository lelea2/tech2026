import { useEffect, useState } from "react";

type SearchState<T> = {
  data: T[];
  loading: boolean;
  error: string | null;
};

export function useSearch<T>(
  query: string,
  searchFn: (query: string, signal: AbortSignal) => Promise<T[]>,
  delay = 300
): SearchState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const timerId = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await searchFn(
          trimmedQuery,
          controller.signal
        );

        setData(results);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Search failed"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, delay);

    return () => {
      window.clearTimeout(timerId);
      controller.abort();
    };
  }, [query, searchFn, delay]);

  return { data, loading, error };
}

// Usage
import { useCallback, useState } from "react";

type User = {
  id: string;
  name: string;
};

export default function UserSearch() {
  const [query, setQuery] = useState("");

  const searchUsers = useCallback(
    async (
      query: string,
      signal: AbortSignal
    ): Promise<User[]> => {
      const response = await fetch(
        `/api/users?q=${encodeURIComponent(query)}`,
        { signal }
      );

      if (!response.ok) {
        throw new Error("Unable to search users");
      }

      return response.json();
    },
    []
  );

  const { data, loading, error } = useSearch(
    query,
    searchUsers,
    300
  );

  return (
    <div>
      <label htmlFor="user-search">Search users</label>

      <input
        id="user-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Enter a name"
      />

      {loading && <p role="status">Searching...</p>}
      {error && <p role="alert">{error}</p>}

      <ul>
        {data.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}