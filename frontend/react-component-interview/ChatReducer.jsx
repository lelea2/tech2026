import React, {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";

/**
 * ============================================================
 * 1. Initial reducer state
 * each submit accept 2 type of message 
{ role: "user", content: prompt }
{
  role: "assistant",
  content: "",
  status: "loading",
  requestId
}
 * ============================================================
 */

const initialState = {
  status: "idle", // "idle" | "loading" | "streaming" | "success" | "error" | "stopped",
  messages: [],
  activeRequestId: null,
  activeAssistantIndex: null,
  nextRequestId: 1,
  canSubmit: true,
};

/**
 * ============================================================
 * 2. Chat reducer
 * ============================================================
 *
 * This reducer owns the visual transcript state.
 *
 * It is intentionally strict:
 * - duplicate submits are ignored
 * - stale chunks are ignored
 * - errors preserve partial assistant content
 * - stop marks the active assistant as stopped
 */

function chatReducer(state, action) {
  switch (action.type) {
    case "submit": {
      const prompt = action.prompt || "";

      if (!prompt.trim()) {
        return state;
      }

      if (state.activeRequestId !== null) {
        return state;
      }

      const requestId = state.nextRequestId;

      const messages = [
        ...state.messages,
        {
          role: "user",
          content: prompt,
        },
        {
          role: "assistant",
          content: "",
          status: "loading",
          error: "",
          requestId,
        },
      ];

      return {
        ...state,
        status: "loading",
        messages,
        activeRequestId: requestId,
        activeAssistantIndex: messages.length - 1,
        nextRequestId: requestId + 1,
        canSubmit: false,
      };
    }

    case "chunk": {
      if (action.requestId !== state.activeRequestId) {
        return state;
      }

      if (state.activeAssistantIndex === null) {
        return state;
      }

      return {
        ...state,
        status: "streaming",
        canSubmit: false,
        messages: state.messages.map((message, index) => {
          if (index !== state.activeAssistantIndex) {
            return message;
          }

          return {
            ...message,
            status: "streaming",
            content: message.content + (action.text || ""),
          };
        }),
      };
    }

    case "done": {
      if (action.requestId !== state.activeRequestId) {
        return state;
      }

      if (state.activeAssistantIndex === null) {
        return state;
      }

      return {
        ...state,
        status: "success",
        activeRequestId: null,
        activeAssistantIndex: null,
        canSubmit: true,
        messages: state.messages.map((message, index) => {
          if (index !== state.activeAssistantIndex) {
            return message;
          }

          return {
            ...message,
            status: "success",
          };
        }),
      };
    }

    case "error": {
      if (action.requestId !== state.activeRequestId) {
        return state;
      }

      if (state.activeAssistantIndex === null) {
        return state;
      }

      return {
        ...state,
        status: "error",
        activeRequestId: null,
        activeAssistantIndex: null,
        canSubmit: true,
        messages: state.messages.map((message, index) => {
          if (index !== state.activeAssistantIndex) {
            return message;
          }

          return {
            ...message,
            status: "error",
            error: action.error || "Unknown error",
          };
        }),
      };
    }

    case "stop": {
      if (state.activeRequestId === null) {
        return state;
      }

      if (state.activeAssistantIndex === null) {
        return state;
      }

      return {
        ...state,
        status: "stopped",
        activeRequestId: null,
        activeAssistantIndex: null,
        canSubmit: true,
        messages: state.messages.map((message, index) => {
          if (index !== state.activeAssistantIndex) {
            return message;
          }

          return {
            ...message,
            status: "stopped",
          };
        }),
      };
    }

    default:
      return state;
  }
}

/**
 * ============================================================
 * 3. Batched aria-live announcement reducer
 * ============================================================
 *
 * Visual text updates immediately in chatReducer.
 * Screen-reader text is buffered and flushed on timer.
 */

function announcementReducer(state, action) {
  switch (action.type) {
    case "reset": {
      return {
        buffer: "",
        liveText: "",
      };
    }

    case "append": {
      return {
        ...state,
        buffer: state.buffer + (action.text || ""),
      };
    }

    case "flush": {
      if (!state.buffer) {
        return state;
      }

      return {
        buffer: "",
        liveText: state.buffer,
      };
    }

    case "flushWithMessage": {
      const message = action.message || "";

      return {
        buffer: "",
        liveText: state.buffer
          ? `${state.buffer} ${message}`
          : message,
      };
    }

    default:
      return state;
  }
}

/**
 * ============================================================
 * 4. Hook: batched screen-reader announcements
 * ============================================================
 */

function useBatchedLiveAnnouncement(isStreaming, intervalMs = 750) {
  const [announcementState, announcementDispatch] = useReducer(
    announcementReducer,
    {
      buffer: "",
      liveText: "",
    }
  );

  useEffect(() => {
    if (!isStreaming) {
      return;
    }

    const timerId = window.setInterval(() => {
      announcementDispatch({ type: "flush" });
    }, intervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isStreaming, intervalMs]);

  return {
    liveText: announcementState.liveText,

    resetAnnouncement() {
      announcementDispatch({ type: "reset" });
    },

    appendAnnouncement(text) {
      announcementDispatch({
        type: "append",
        text,
      });
    },

    flushAnnouncement() {
      announcementDispatch({
        type: "flush",
      });
    },

    flushWithMessage(message) {
      announcementDispatch({
        type: "flushWithMessage",
        message,
      });
    },
  };
}

/**
 * ============================================================
 * 5. Hook: smart auto-scroll
 * ============================================================
 *
 * Auto-scroll only while the user is near the bottom.
 * If user scrolls up, preserve their scroll position.
 */

function useSmartAutoScroll(dependency, threshold = 80) {
  const containerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const [isNearBottom, setIsNearBottom] = useState(true);

  function isElementNearBottom(element) {
    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    return distanceFromBottom <= threshold;
  }

  function handleScroll() {
    const element = containerRef.current;
    if (!element) return;

    const nearBottom = isElementNearBottom(element);

    shouldAutoScrollRef.current = nearBottom;
    setIsNearBottom(nearBottom);
  }

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (shouldAutoScrollRef.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [dependency]);

  function scrollToBottom() {
    const element = containerRef.current;
    if (!element) return;

    element.scrollTop = element.scrollHeight;
    shouldAutoScrollRef.current = true;
    setIsNearBottom(true);
  }

  return {
    containerRef,
    handleScroll,
    isNearBottom,
    scrollToBottom,
  };
}

/**
 * ============================================================
 * 6. Mock streaming helpers
 * ============================================================
 */

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function buildMockResponse(prompt) {
  return `
Mock response for: "${prompt}"

This is a long streaming assistant response.

The visual transcript updates immediately on every tiny chunk, but the hidden screen-reader live region batches announcements so it does not become noisy.

The scroll behavior is also careful. If the user is already near the bottom, the viewport follows the stream. But if the user scrolls up to read earlier text, new chunks do not yank the viewport down.

This is a good interview problem because it tests reducer modeling, stale async protection, cancellation, accessibility, and real chat UX behavior.
`.repeat(2);
}

async function mockStreamResponse({
  requestId,
  prompt,
  dispatch,
  isCancelled,
  appendAnnouncement,
  flushAnnouncement,
  flushWithMessage,
}) {
  const response = buildMockResponse(prompt);

  try {
    for (const char of response) {
      if (isCancelled(requestId)) {
        return;
      }

      await sleep(15);

      if (isCancelled(requestId)) {
        return;
      }

      dispatch({
        type: "chunk",
        requestId,
        text: char,
      });

      appendAnnouncement(char);
    }

    if (isCancelled(requestId)) {
      return;
    }

    dispatch({
      type: "done",
      requestId,
    });

    flushAnnouncement();
  } catch (error) {
    dispatch({
      type: "error",
      requestId,
      error: error.message,
    });

    flushWithMessage(`Response failed: ${error.message}`);
  }
}

/**
 * ============================================================
 * 7. Main React app
 * ============================================================
 */

export default function App() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [input, setInput] = useState("");

  const cancelledRequestsRef = useRef(new Set());

  const isStreaming =
    state.status === "loading" || state.status === "streaming";

  const {
    liveText,
    resetAnnouncement,
    appendAnnouncement,
    flushAnnouncement,
    flushWithMessage,
  } = useBatchedLiveAnnouncement(isStreaming, 750);

  /**
   * The dependency should change whenever visual content grows.
   * This lets the smart auto-scroll hook react to streaming chunks.
   */
  const latestMessageContent =
    state.messages[state.messages.length - 1]?.content || "";

  const {
    containerRef,
    handleScroll,
    isNearBottom,
    scrollToBottom,
  } = useSmartAutoScroll(latestMessageContent, 80);

  function isCancelled(requestId) {
    return cancelledRequestsRef.current.has(requestId);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const prompt = input;

    if (!prompt.trim()) {
      return;
    }

    if (!state.canSubmit) {
      return;
    }

    const requestId = state.nextRequestId;

    resetAnnouncement();

    dispatch({
      type: "submit",
      prompt,
    });

    setInput("");

    await mockStreamResponse({
      requestId,
      prompt,
      dispatch,
      isCancelled,
      appendAnnouncement,
      flushAnnouncement,
      flushWithMessage,
    });
  }

  function handleStop() {
    if (state.activeRequestId === null) {
      return;
    }

    cancelledRequestsRef.current.add(state.activeRequestId);

    dispatch({
      type: "stop",
    });

    flushWithMessage("Response stopped.");
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Streaming Chat Interview App</h1>

      <p style={styles.description}>
        Multi-turn transcript, streaming reducer, cancellation, stale request
        protection, smart auto-scroll, and batched accessibility announcements.
      </p>

      <div style={styles.statusBar}>
        <span>
          Status: <strong>{state.status}</strong>
        </span>

        <span>
          Active request:{" "}
          <strong>{state.activeRequestId ?? "none"}</strong>
        </span>
      </div>

      <div style={styles.transcriptWrapper}>
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={styles.messages}
        >
          {state.messages.length === 0 && (
            <div style={styles.emptyState}>
              Submit a prompt to start streaming.
            </div>
          )}

          {state.messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div
                key={index}
                style={{
                  ...styles.message,
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  background: isUser ? "#e8f0fe" : "#f5f5f5",
                }}
              >
                <div style={styles.role}>
                  {message.role}
                  {message.requestId
                    ? ` · request ${message.requestId}`
                    : ""}
                </div>

                <div style={styles.content}>
                  {message.content || "..."}
                </div>

                {message.role === "assistant" && (
                  <div style={styles.meta}>
                    {message.status}
                    {message.error ? ` · ${message.error}` : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!isNearBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            style={styles.jumpButton}
          >
            Jump to bottom
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          value={input}
          disabled={!state.canSubmit}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask something..."
          style={styles.input}
        />

        <button
          type="submit"
          disabled={!state.canSubmit}
          style={styles.button}
        >
          Submit
        </button>

        <button
          type="button"
          disabled={state.activeRequestId === null}
          onClick={handleStop}
          style={styles.button}
        >
          Stop
        </button>
      </form>

      <div style={styles.debug}>
        <strong>Accessibility live region text:</strong>
        <pre style={styles.pre}>{liveText || "(empty)"}</pre>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        style={styles.srOnly}
      >
        {liveText}
      </div>
    </div>
  );
}

/**
 * ============================================================
 * 8. Styles
 * ============================================================
 */

const styles = {
  page: {
    maxWidth: 820,
    margin: "40px auto",
    fontFamily:
      "Arial, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginTop: 0,
    color: "#555",
    lineHeight: 1.5,
  },
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 12,
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#fafafa",
    fontSize: 14,
  },
  transcriptWrapper: {
    position: "relative",
  },
  messages: {
    height: 380,
    overflowY: "auto",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: "white",
  },
  emptyState: {
    color: "#777",
    textAlign: "center",
    marginTop: 120,
  },
  message: {
    maxWidth: "78%",
    padding: 12,
    borderRadius: 10,
    whiteSpace: "pre-wrap",
  },
  role: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
    color: "#555",
  },
  content: {
    lineHeight: 1.5,
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  jumpButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #ccc",
    background: "white",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  form: {
    display: "flex",
    gap: 8,
    marginTop: 16,
  },
  input: {
    flex: 1,
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 14,
  },
  button: {
    padding: "10px 14px",
    border: "1px solid #ccc",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
  },
  debug: {
    marginTop: 20,
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 8,
    background: "#fafafa",
    fontSize: 13,
  },
  pre: {
    whiteSpace: "pre-wrap",
    marginBottom: 0,
  },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
};