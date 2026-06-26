import React, {
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";

const MODELS = {
  "gpt-4.1": {
    modelVersion: "gpt-4.1",
    temperature: 0.7,
    maxTokens: 800,
  },
  "gpt-4.1-mini": {
    modelVersion: "gpt-4.1-mini",
    temperature: 0.5,
    maxTokens: 500,
  },
  "gpt-4o": {
    modelVersion: "gpt-4o",
    temperature: 0.8,
    maxTokens: 1000,
  },
};

const INITIAL_PRESETS = [
  {
    id: 1,
    name: "Summarize",
    prompt: "Summarize the following text in 3 bullet points:",
  },
  {
    id: 2,
    name: "Rewrite",
    prompt: "Rewrite this to be clearer and more concise:",
  },
  {
    id: 3,
    name: "Explain",
    prompt: "Explain this like I am new to the topic:",
  },
];

const initialState = {
  turns: [],
  status: "idle", // idle | loading | streaming | success | error | stopped

  activeRequestId: null,
  nextRequestId: 1,

  modelVersion: "gpt-4.1-mini",
  hyperParameters: {
    temperature: 0.5,
    maxTokens: 500,
  },

  presets: INITIAL_PRESETS,
  selectedPresetId: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "change_model": {
      const model = MODELS[action.modelVersion];

      return {
        ...state,
        modelVersion: model.modelVersion,
        hyperParameters: {
          temperature: model.temperature,
          maxTokens: model.maxTokens,
        },
      };
    }

    case "change_hyper_parameter": {
      return {
        ...state,
        hyperParameters: {
          ...state.hyperParameters,
          [action.name]: action.value,
        },
      };
    }

    case "select_preset": {
      return {
        ...state,
        selectedPresetId: action.presetId,
      };
    }

    case "save_preset": {
      const name = action.name.trim();
      const prompt = action.prompt.trim();

      if (!name || !prompt) return state;

      const newPreset = {
        id: Date.now(),
        name,
        prompt,
      };

      return {
        ...state,
        presets: [...state.presets, newPreset],
        selectedPresetId: String(newPreset.id),
      };
    }

    case "submit": {
      const prompt = action.prompt.trim();

      if (!prompt) return state;

      // Ignore duplicate submit while a request is active.
      if (state.activeRequestId !== null) return state;

      const requestId = state.nextRequestId;

      return {
        ...state,
        status: "loading",
        activeRequestId: requestId,
        nextRequestId: requestId + 1,
        turns: [
          ...state.turns,
          {
            id: requestId,
            requestId,
            status: "loading",

            modelVersion: action.modelVersion,
            hyperParameters: action.hyperParameters,

            user: {
              content: prompt,
            },

            assistant: {
              content: "",
              error: null,
            },
          },
        ],
      };
    }

    case "chunk": {
      if (action.requestId !== state.activeRequestId) return state;

      return {
        ...state,
        status: "streaming",
        turns: state.turns.map((turn) => {
          if (turn.requestId !== action.requestId) return turn;

          return {
            ...turn,
            status: "streaming",
            assistant: {
              ...turn.assistant,
              content: turn.assistant.content + action.text,
            },
          };
        }),
      };
    }

    case "done": {
      if (action.requestId !== state.activeRequestId) return state;

      return {
        ...state,
        status: "success",
        activeRequestId: null,
        turns: state.turns.map((turn) => {
          if (turn.requestId !== action.requestId) return turn;

          return {
            ...turn,
            status: "success",
          };
        }),
      };
    }

    case "error": {
      if (action.requestId !== state.activeRequestId) return state;

      return {
        ...state,
        status: "error",
        activeRequestId: null,
        turns: state.turns.map((turn) => {
          if (turn.requestId !== action.requestId) return turn;

          return {
            ...turn,
            status: "error",
            assistant: {
              ...turn.assistant,
              error: action.error,
            },
          };
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
        turns: state.turns.map((turn) => {
          if (turn.requestId !== requestId) return turn;

          return {
            ...turn,
            status: "stopped",
          };
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

function buildMockResponse({
  prompt,
  modelVersion,
  hyperParameters,
}) {
  return (
    `Mock response from ${modelVersion}\n\n` +
    `Prompt:\n"${prompt}"\n\n` +
    `Hyperparameters:\n` +
    `- temperature: ${hyperParameters.temperature}\n` +
    `- maxTokens: ${hyperParameters.maxTokens}\n\n` +
    `This response streams one character at a time.\n\n` +
    `The reducer stores each chat turn as one wrapper containing both the user message and assistant response. ` +
    `That makes the UI easier to render and keeps model metadata attached to the generated answer.\n\n` +
    `The conversation also auto-scrolls only when the user is already near the bottom. `.repeat(
      8
    )
  );
}

async function streamMockResponse({
  prompt,
  requestId,
  modelVersion,
  hyperParameters,
  dispatch,
  cancelledRequestsRef,
}) {
  const response = buildMockResponse({
    prompt,
    modelVersion,
    hyperParameters,
  });

  try {
    for (const char of response) {
      if (cancelledRequestsRef.current.has(requestId)) {
        return;
      }

      await sleep(20);

      if (cancelledRequestsRef.current.has(requestId)) {
        return;
      }

      dispatch({
        type: "chunk",
        requestId,
        text: char,
      });
    }

    if (cancelledRequestsRef.current.has(requestId)) {
      return;
    }

    dispatch({
      type: "done",
      requestId,
    });
  } catch (error) {
    dispatch({
      type: "error",
      requestId,
      error: error.message || "Something went wrong.",
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
  const [presetName, setPresetName] = useState("");

  const cancelledRequestsRef = useRef(new Set());

  const isRunning = state.activeRequestId !== null;

  const lastTurn = state.turns[state.turns.length - 1];
  const lastAssistantContent = lastTurn?.assistant.content || "";

  const { containerRef, handleScroll } = useAutoScroll(lastAssistantContent);

  function handlePresetChange(presetId) {
    dispatch({
      type: "select_preset",
      presetId,
    });

    const preset = state.presets.find(
      (item) => item.id === Number(presetId)
    );

    if (preset) {
      setInput(preset.prompt);
    }
  }

  function handleSavePreset() {
    dispatch({
      type: "save_preset",
      name: presetName,
      prompt: input,
    });

    setPresetName("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const prompt = input.trim();

    if (!prompt) return;
    if (state.activeRequestId !== null) return;

    const requestId = state.nextRequestId;

    // Snapshot the model config at submit time.
    const modelVersion = state.modelVersion;
    const hyperParameters = {
      temperature: Number(state.hyperParameters.temperature),
      maxTokens: Number(state.hyperParameters.maxTokens),
    };

    dispatch({
      type: "submit",
      prompt,
      modelVersion,
      hyperParameters,
    });

    setInput("");

    await streamMockResponse({
      prompt,
      requestId,
      modelVersion,
      hyperParameters,
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

  return (
    <div style={styles.page}>
      <h2>GPT Playground</h2>

      <div style={styles.status}>
        Status: <strong>{state.status}</strong>
      </div>

      <section style={styles.configPanel}>
        <label style={styles.label}>
          Model
          <select
            value={state.modelVersion}
            disabled={isRunning}
            onChange={(event) =>
              dispatch({
                type: "change_model",
                modelVersion: event.target.value,
              })
            }
            style={styles.input}
          >
            {Object.keys(MODELS).map((modelVersion) => (
              <option key={modelVersion} value={modelVersion}>
                {modelVersion}
              </option>
            ))}
          </select>
        </label>

        <div style={styles.row}>
          <label style={styles.label}>
            Temperature
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={state.hyperParameters.temperature}
              disabled={isRunning}
              onChange={(event) =>
                dispatch({
                  type: "change_hyper_parameter",
                  name: "temperature",
                  value: event.target.value,
                })
              }
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Max Tokens
            <input
              type="number"
              min="1"
              max="4000"
              value={state.hyperParameters.maxTokens}
              disabled={isRunning}
              onChange={(event) =>
                dispatch({
                  type: "change_hyper_parameter",
                  name: "maxTokens",
                  value: event.target.value,
                })
              }
              style={styles.input}
            />
          </label>
        </div>

        <label style={styles.label}>
          Preset
          <select
            value={state.selectedPresetId}
            disabled={isRunning}
            onChange={(event) => handlePresetChange(event.target.value)}
            style={styles.input}
          >
            <option value="">Select preset</option>

            {state.presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </label>

        <div style={styles.row}>
          <input
            value={presetName}
            disabled={isRunning}
            placeholder="New preset name"
            onChange={(event) => setPresetName(event.target.value)}
            style={styles.input}
          />

          <button
            type="button"
            disabled={isRunning || !presetName.trim() || !input.trim()}
            onClick={handleSavePreset}
          >
            Save Preset
          </button>
        </div>
      </section>

      <section
        ref={containerRef}
        onScroll={handleScroll}
        style={styles.conversation}
      >
        {state.turns.length === 0 && (
          <div style={styles.empty}>Ask something to start chatting.</div>
        )}

        {state.turns.map((turn) => (
          <div key={turn.id} style={styles.turn}>
            <div style={styles.turnHeader}>
              <strong>Request #{turn.requestId}</strong>
              <span>{turn.status}</span>
            </div>

            <div style={styles.userMessage}>
              <div style={styles.role}>USER</div>
              <div>{turn.user.content}</div>
            </div>

            <div style={styles.assistantMessage}>
              <div style={styles.role}>ASSISTANT</div>

              <div style={styles.modelMeta}>
                {turn.modelVersion} · temperature{" "}
                {turn.hyperParameters.temperature} · max tokens{" "}
                {turn.hyperParameters.maxTokens}
              </div>

              <div>{turn.assistant.content || "..."}</div>

              {turn.assistant.error && (
                <div style={styles.error}>{turn.assistant.error}</div>
              )}
            </div>
          </div>
        ))}
      </section>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          value={input}
          disabled={isRunning}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask something..."
          style={styles.promptInput}
        />

        <button disabled={isRunning || !input.trim()} type="submit">
          Submit
        </button>

        <button type="button" disabled={!isRunning} onClick={handleStop}>
          Stop
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 860,
    margin: "40px auto",
    padding: 16,
    fontFamily: "Arial, sans-serif",
  },

  status: {
    marginBottom: 12,
  },

  configPanel: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: "#fafafa",
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontWeight: "bold",
  },

  row: {
    display: "flex",
    gap: 8,
  },

  input: {
    flex: 1,
    padding: 10,
  },

  conversation: {
    height: 420,
    overflowY: "auto",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    background: "white",
  },

  empty: {
    color: "#777",
    fontSize: 14,
  },

  turn: {
    border: "1px solid #e5e5e5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    background: "#fff",
  },

  turnHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },

  userMessage: {
    marginLeft: "auto",
    maxWidth: "75%",
    padding: 12,
    borderRadius: 8,
    background: "#e8f0fe",
    marginBottom: 10,
    whiteSpace: "pre-wrap",
  },

  assistantMessage: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 8,
    background: "#f4f4f4",
    whiteSpace: "pre-wrap",
  },

  role: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },

  modelMeta: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },

  error: {
    marginTop: 8,
    color: "crimson",
    fontSize: 13,
  },

  form: {
    display: "flex",
    gap: 8,
    marginTop: 16,
  },

  promptInput: {
    flex: 1,
    padding: 10,
  },
};