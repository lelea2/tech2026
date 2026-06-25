function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockFetchSSE(url, options = {}) {
  if (url !== "/api/generate") {
    return new Response("Not found", { status: 404 });
  }

  const signal = options.signal;

  let prompt = "";

  try {
    const body = JSON.parse(options.body || "{}");
    prompt = body.prompt || "";
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const encoder = new TextEncoder();

  const tokens = [
    `You asked: ${prompt}\n\n`,
    "Thinking...\n",
    "Here is a structured response:\n",
    "1. Use fetch to call the API.\n",
    "2. Use ReadableStream to read chunks.\n",
    "3. Use AbortController to cancel.\n",
    "4. Save completed runs to history.\n"
  ];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (const token of tokens) {
          if (signal?.aborted) {
            throw new DOMException("Aborted", "AbortError");
          }

          await sleep(400);

          const event = `data: ${JSON.stringify({ text: token })}\n\n`;
          controller.enqueue(encoder.encode(event));
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream"
    }
  });
}

export async function readSSEStream(response, onToken) {
  if (!response.body) {
    throw new Error("Response body is empty");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed.startsWith("data:")) continue;

      const data = trimmed.slice("data:".length).trim();

      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        onToken(parsed.text || "");
      } catch {
        // Ignore malformed stream line.
      }
    }
  }
}

/***************************************************************/
import React, { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "prompt-playground-runs";

function loadRuns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRuns(runs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

function createRun(prompt, output, status) {
  return {
    id: crypto.randomUUID(),
    prompt,
    output,
    status,
    createdAt: new Date().toISOString()
  };
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [runs, setRuns] = useState(loadRuns);

  const abortRef = useRef(null);
  const outputRef = useRef("");

  const isRunning = status === "running";
  const canRun = prompt.trim() && !isRunning;

  useEffect(() => {
    saveRuns(runs);
  }, [runs]);

  async function handleRun() {
    if (!canRun) return;

    const controller = new AbortController();
    abortRef.current = controller;
    outputRef.current = "";

    setOutput("");
    setError("");
    setStatus("running");

    try {
      const response = await mockFetchSSE("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      await readSSEStream(response, (token) => {
        console.log('>>>> reading');
        outputRef.current += token;
        setOutput(outputRef.current);
      });

      const run = createRun(prompt, outputRef.current, "completed");
      setRuns((prev) => [run, ...prev]);
      setStatus("completed");
    } catch (err) {
      if (err.name === "AbortError") {
        const run = createRun(prompt, outputRef.current, "cancelled");
        setRuns((prev) => [run, ...prev]);
        setStatus("cancelled");
        return;
      }

      setError(err.message || "Something went wrong");
      setStatus("error");
    } finally {
      abortRef.current = null;
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  function handleSelectRun(run) {
    if (isRunning) return;

    setPrompt(run.prompt);
    setOutput(run.output);
    setStatus(run.status);
    setError("");
  }

  function handleClearHistory() {
    setRuns([]);
  }

  return (
    <main className="page">
      <h1>Prompt Playground</h1>

      <textarea
        className="textarea"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Enter a prompt..."
      />

      <div className="actions">
        <button onClick={handleRun} disabled={!canRun}>
          Run
        </button>

        <button onClick={handleCancel} disabled={!isRunning}>
          Cancel
        </button>

        <button onClick={handleClearHistory} disabled={runs.length === 0}>
          Clear History
        </button>
      </div>

      <p>
        <strong>Status:</strong> {status}
      </p>

      {error && <p className="error">{error}</p>}

      <section>
        <h2>Output</h2>
        <pre className="output">{output || "No output yet."}</pre>
      </section>

      <section>
        <h2>Run History</h2>

        {runs.length === 0 ? (
          <p>No previous runs.</p>
        ) : (
          <div className="history">
            {runs.map((run) => (
              <button
                key={run.id}
                className="historyItem"
                onClick={() => handleSelectRun(run)}
                disabled={isRunning}
              >
                <strong>{run.prompt.slice(0, 80)}</strong>
                <span>{run.status}</span>
                <small>{new Date(run.createdAt).toLocaleString()}</small>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}