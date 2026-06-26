import React, { useLayoutEffect, useReducer, useRef, useState } from "react";

const initialState = {
  messages: [],
  status: "idle", //// "idle" | "loading" | "streaming" | "success" | "error" | "stopped",
  activeRequestId: null,
  nextRequestId: 1,
};

function reducer(state, action) {
  switch (action.type) {
    case "submit": { // user submit
      const prompt = action.prompt.trim();

      if (!prompt) return state;

      // Ignore duplicate submit while streaming.
      if (state.activeRequestId !== null) return state;

      const requestId = state.nextRequestId;

      return {
        ...state,
        status: "loading",
        activeRequestId: requestId,
        nextRequestId: requestId + 1,
        messages: [ // array of message
          ...state.messages,
          {
            role: "user",
            content: prompt,
          },
          {
            role: "assistant",
            content: "",
            status: "loading",
            requestId,
          },
        ],
      };
    }

    case "chunk": {
      if (action.requestId !== state.activeRequestId) return state;

      return {
        ...state,
        status: "streaming",
        messages: state.messages.map((message) => {
          if (
            message.role === "assistant" &&
            message.requestId === action.requestId
          ) {
            return {
              ...message,
              status: "streaming",
              content: message.content + action.text,
            };
          }

          return message;
        }),
      };
    }

    case "done": {
      if (action.requestId !== state.activeRequestId) return state;

      return {
        ...state,
        status: "success",
        activeRequestId: null,
        messages: state.messages.map((message) => {
          if (
            message.role === "assistant" &&
            message.requestId === action.requestId
          ) {
            return {
              ...message,
              status: "success",
            };
          }

          return message;
        }),
      };
    }

    case "error": {
      if (action.requestId !== state.activeRequestId) return state;

      return {
        ...state,
        status: "error",
        activeRequestId: null,
        messages: state.messages.map((message) => {
          if (
            message.role === "assistant" &&
            message.requestId === action.requestId
          ) {
            return {
              ...message,
              status: "error",
              error: action.error,
            };
          }

          return message;
        }),
      };
    }

    case "stop": {
      if (state.activeRequestId === null) return state;

      const requestId = state.activeRequestId;

      return {
        ...state,
        status: "stopped",
        activeRequestId: null,
        messages: state.messages.map((message) => {
          if (
            message.role === "assistant" &&
            message.requestId === requestId
          ) {
            return {
              ...message,
              status: "stopped",
            };
          }

          return message;
        }),
      };
    }

    default:
      return state;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function streamMockResponse({
  prompt,
  requestId,
  dispatch,
  cancelledRequestsRef,
}) {
  const response =
    `Mock response for "${prompt}". ` +
    `This response streams one character at a time. ` +
    `The reducer ignores stale chunks and duplicate submits.`;

  try {
    for (const char of response) {
      if (cancelledRequestsRef.current.has(requestId)) return;

      await sleep(25);

      if (cancelledRequestsRef.current.has(requestId)) return;

      dispatch({
        type: "chunk",
        requestId,
        text: char,
      });
    }

    if (cancelledRequestsRef.current.has(requestId)) return;

    dispatch({
      type: "done",
      requestId,
    });
  } catch (error) {
    dispatch({
      type: "error",
      requestId,
      error: error.message,
    });
  }
}

function useAutoScroll(dependency) {
  const containerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    shouldAutoScrollRef.current = distanceFromBottom < 80;
  }

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (shouldAutoScrollRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [dependency]);

  return {
    containerRef,
    handleScroll,
  };
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [input, setInput] = useState("");

  const cancelledRequestsRef = useRef(new Set());

  const lastMessageContent =
    state.messages[state.messages.length - 1]?.content || "";

  const { containerRef, handleScroll } = useAutoScroll(lastMessageContent);

  async function handleSubmit(event) {
    event.preventDefault();

    const prompt = input.trim();

    if (!prompt) return;
    if (state.activeRequestId !== null) return;

    const requestId = state.nextRequestId;

    dispatch({
      type: "submit",
      prompt,
    });

    setInput("");

    await streamMockResponse({
      prompt,
      requestId,
      dispatch,
      cancelledRequestsRef,
    });
  }

  function handleStop() {
    if (state.activeRequestId === null) return;

    cancelledRequestsRef.current.add(state.activeRequestId);

    dispatch({
      type: "stop",
    });
  }

  const isStreaming = state.activeRequestId !== null;

  return (
    <div style={styles.page}>
      <h2>Simple Streaming Chat</h2>

      <div style={styles.status}>
        Status: <strong>{state.status}</strong>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={styles.messages}
      >
        {state.messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf:
                message.role === "user" ? "flex-end" : "flex-start",
              background:
                message.role === "user" ? "#e8f0fe" : "#f4f4f4",
            }}
          >
            <div style={styles.role}>{message.role}</div>
            <div>{message.content || "..."}</div>

            {message.role === "assistant" && (
              <div style={styles.meta}>
                {message.status}
                {message.error ? `: ${message.error}` : ""}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          value={input}
          disabled={isStreaming}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask something..."
          style={styles.input}
        />

        <button disabled={isStreaming} type="submit">
          Submit
        </button>

        <button
          type="button"
          disabled={!isStreaming}
          onClick={handleStop}
        >
          Stop
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 720,
    margin: "40px auto",
    fontFamily: "Arial, sans-serif",
  },
  status: {
    marginBottom: 12,
  },
  messages: {
    height: 360,
    overflowY: "auto",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  message: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 8,
    whiteSpace: "pre-wrap",
  },
  role: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: "#666",
  },
  form: {
    display: "flex",
    gap: 8,
    marginTop: 16,
  },
  input: {
    flex: 1,
    padding: 10,
  },
};