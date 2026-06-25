import React, {useState, useCallback} from "react";

export function useAsync(asyncFunction, options = {}) {
  const { immediate = false, initialArgs = [] } = options;

  const [status, setStatus] = useState("idle");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);

  const execute = useCallback(
    async (...args) => {
      const requestId = ++requestIdRef.current;

      setStatus("loading");
      setData(null);
      setError(null);

      try {
        const result = await asyncFunction(...args);

        // Ignore stale responses.
        if (requestId === requestIdRef.current) {
          setStatus("success");
          setData(result);
        }

        return result;
      } catch (err) {
        const normalizedError =
          err instanceof Error ? err : new Error(String(err));

        if (requestId === requestIdRef.current) {
          setStatus("error");
          setError(normalizedError);
        }

        throw normalizedError;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setStatus("idle");
    setData(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute(...initialArgs);
    }
  }, [immediate, execute]);

  return {
    status,
    data,
    error,
    execute,
    reset,
    isIdle: status === "idle",
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
  };
}

// Example usage
function UserProfile({ userId }) {
  const fetchUser = useCallback(async (id) => {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    return response.json();
  }, []);

  const userRequest = useAsync(fetchUser);

  useEffect(() => {
    userRequest.execute(userId);
  }, [userId]);

  if (userRequest.isLoading) return <p>Loading...</p>;
  if (userRequest.isError) return <p>{userRequest.error.message}</p>;

  return <p>{userRequest.data?.name}</p>;
}