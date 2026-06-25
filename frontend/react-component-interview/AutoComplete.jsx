import React, { useEffect, useMemo, useRef, useState } from "react";

const AI_PRODUCTS = [
  { id: 1, name: "ChatGPT", company: "OpenAI", category: "AI Assistant" },
  { id: 2, name: "Claude", company: "Anthropic", category: "AI Assistant" },
  { id: 3, name: "Gemini", company: "Google", category: "AI Assistant" },
  { id: 4, name: "Perplexity", company: "Perplexity AI", category: "AI Search" },
  { id: 5, name: "Midjourney", company: "Midjourney", category: "Image Generation" },
  { id: 6, name: "Runway", company: "Runway", category: "Video Generation" },
  { id: 7, name: "Cursor", company: "Anysphere", category: "AI Code Editor" },
  { id: 8, name: "Replit Agent", company: "Replit", category: "AI Coding" },
  { id: 9, name: "GitHub Copilot", company: "GitHub", category: "AI Coding" },
  { id: 10, name: "Character AI", company: "Character.AI", category: "AI Companion" },
  { id: 11, name: "NotebookLM", company: "Google", category: "AI Research" },
  { id: 12, name: "Grok", company: "xAI", category: "AI Assistant" },
];

/**
 * Interview-friendly mock fetch.
 * fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal })
 */
function mockFetchAIProducts(query, signal) {
  const url = `/api/ai-products?q=${encodeURIComponent(query)}`;

  return new Promise((resolve, reject) => {
    const latency = 120;

    const timeoutId = setTimeout(() => {
      if (signal?.aborted) {
        reject(new DOMException("Request aborted", "AbortError"));
        return;
      }

      const parsedUrl = new URL(url, window.location.origin);
      const q = parsedUrl.searchParams.get("q") || "";
      const normalizedQuery = q.trim().toLowerCase();

      if (normalizedQuery === "error") {
        reject(new Error("Mock API failed"));
        return;
      }

      const results = AI_PRODUCTS.filter((item) => {
        return (
          item.name.toLowerCase().includes(normalizedQuery) ||
          item.company.toLowerCase().includes(normalizedQuery) ||
          item.category.toLowerCase().includes(normalizedQuery)
        );
      });

      resolve({
        ok: true,
        status: 200,
        json: async () => results,
      });
    }, latency);

    signal?.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Request aborted", "AbortError"));
    });
  });
}

async function fetchAIProducts(query, signal) {
  const response = await mockFetchAIProducts(query, signal);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function useDebouncedValue(value, delay = 200) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timerId);
    };
  }, [value, delay]);

  return debouncedValue;
}

function useAsync(asyncFunction, dependencies = [], options = {}) {
  const { immediate = true } = options;

  const [state, setState] = useState({
    status: "idle",
    data: null,
    error: null,
  });

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!immediate) {
      setState({
        status: "idle",
        data: null,
        error: null,
      });
      return;
    }

    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    async function run() {
      setState({
        status: "loading",
        data: null,
        error: null,
      });

      try {
        const data = await asyncFunction(controller.signal);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setState({
          status: "success",
          data,
          error: null,
        });
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        if (requestId !== requestIdRef.current) {
          return;
        }

        setState({
          status: "error",
          data: null,
          error,
        });
      }
    }

    run();

    return () => {
      controller.abort();
    };
  }, dependencies);

  return {
    ...state,
    isIdle: state.status === "idle",
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error",
  };
}

function Autocomplete() {
  const [inputValue, setInputValue] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedQuery = useDebouncedValue(inputValue, 200);

  const shouldSearch = debouncedQuery.trim().length >= 1;

  const searchFunction = useMemo(() => {
    return (signal) => fetchAIProducts(debouncedQuery, signal);
  }, [debouncedQuery]);

  const {
    data: results = [],
    error,
    isLoading,
    isError,
    isSuccess,
  } = useAsync(searchFunction, [searchFunction], {
    immediate: shouldSearch,
  });

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [debouncedQuery]);

  const showDropdown =
    inputValue.trim().length > 0 &&
    (isLoading || isError || isSuccess);

  function handleChange(event) {
    setInputValue(event.target.value);
    setSelectedItem(null);
  }

  function handleSelect(item) {
    setInputValue(item.name);
    setSelectedItem(item);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(event) {
    if (!showDropdown || results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setHighlightedIndex((index) => {
        return index + 1 >= results.length ? 0 : index + 1;
      });
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setHighlightedIndex((index) => {
        return index - 1 < 0 ? results.length - 1 : index - 1;
      });
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (highlightedIndex >= 0) {
        handleSelect(results[highlightedIndex]);
      }
    }

    if (event.key === "Escape") {
      setInputValue("");
      setSelectedItem(null);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>AI Product Autocomplete</h1>

        <p style={styles.description}>
          Try: <strong>chat</strong>, <strong>code</strong>,{" "}
          <strong>google</strong>, <strong>image</strong>, or{" "}
          <strong>error</strong>.
        </p>

        <div style={styles.inputWrapper}>
          <input
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search AI products..."
            style={styles.input}
            aria-label="Search AI products"
          />

          {showDropdown && (
            <div style={styles.dropdown}>
              {isLoading && (
                <div style={styles.stateRow}>Loading...</div>
              )}

              {isError && (
                <div style={styles.errorRow}>
                  {error?.message || "Something went wrong"}
                </div>
              )}

              {!isLoading && !isError && results.length === 0 && (
                <div style={styles.stateRow}>No results found</div>
              )}

              {!isLoading &&
                !isError &&
                results.map((item, index) => {
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <div
                      key={item.id}
                      onMouseDown={() => handleSelect(item)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      style={{
                        ...styles.resultRow,
                        ...(isHighlighted ? styles.highlightedRow : {}),
                      }}
                    >
                      <div style={styles.resultName}>{item.name}</div>
                      <div style={styles.resultMeta}>
                        {item.company} · {item.category}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {selectedItem && (
          <div style={styles.selectedBox}>
            <div style={styles.selectedLabel}>Selected</div>
            <div>
              <strong>{selectedItem.name}</strong> by {selectedItem.company}
            </div>
            <div style={styles.resultMeta}>{selectedItem.category}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <Autocomplete />;
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#e5e7eb",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "80px",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },
  card: {
    width: "520px",
    background: "#111827",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "24px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
  },
  description: {
    color: "#94a3b8",
    lineHeight: "24px",
    marginBottom: "20px",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #475569",
    background: "#020617",
    color: "#e5e7eb",
    fontSize: "16px",
    outline: "none",
  },
  dropdown: {
    position: "absolute",
    top: "56px",
    left: 0,
    right: 0,
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "12px",
    overflow: "hidden",
    zIndex: 10,
  },
  stateRow: {
    padding: "14px 16px",
    color: "#94a3b8",
  },
  errorRow: {
    padding: "14px 16px",
    color: "#fca5a5",
  },
  resultRow: {
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #1e293b",
  },
  highlightedRow: {
    background: "#1e293b",
  },
  resultName: {
    fontWeight: 700,
    marginBottom: "4px",
  },
  resultMeta: {
    fontSize: "14px",
    color: "#94a3b8",
  },
  selectedBox: {
    marginTop: "24px",
    padding: "16px",
    borderRadius: "12px",
    background: "#020617",
    border: "1px solid #334155",
  },
  selectedLabel: {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
};