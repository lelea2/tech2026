import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Interview prompt:
 *
 * Build a reusable poll widget that:
 * - Displays a question and answer options
 * - Allows one selection
 * - Submits a vote asynchronously
 * - Shows loading and error states
 * - Displays results after voting
 * - Prevents duplicate submissions
 * - Ignores obsolete requests after unmount
 */

function PollWidget({ poll, onVote }) {
  const [currentPoll, setCurrentPoll] = useState(poll);
  const [selectedOptionId, setSelectedOptionId] = useState(
    poll.userVoteOptionId ?? null
  );
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const abortControllerRef = useRef(null);

  useEffect(() => {
    abortControllerRef.current?.abort();

    setCurrentPoll(poll);
    setSelectedOptionId(poll.userVoteOptionId ?? null);
    setStatus("idle");
    setError("");
  }, [poll]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const totalVotes = useMemo(() => {
    return currentPoll.options.reduce(
      (total, option) => total + option.voteCount,
      0
    );
  }, [currentPoll.options]);

  const hasVoted = currentPoll.userVoteOptionId != null;

  const hasExpired =
    currentPoll.expiresAt != null &&
    new Date(currentPoll.expiresAt).getTime() <= Date.now();

  const isSubmitting = status === "submitting";

  const canSubmit =
    selectedOptionId != null &&
    !hasVoted &&
    !hasExpired &&
    !isSubmitting;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus("submitting");
    setError("");

    try {
      const updatedPoll = await onVote(
        currentPoll.id,
        selectedOptionId,
        controller.signal
      );

      if (controller.signal.aborted) {
        return;
      }

      setCurrentPoll(updatedPoll);
      setStatus("success");
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }

      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your vote. Please try again."
      );
    }
  }

  if (!currentPoll.options.length) {
    return (
      <section aria-labelledby={`poll-${currentPoll.id}-question`}>
        <h2 id={`poll-${currentPoll.id}-question`}>
          {currentPoll.question}
        </h2>

        <p>This poll does not have any options.</p>
      </section>
    );
  }

  return (
    <section
      className="poll-widget"
      aria-labelledby={`poll-${currentPoll.id}-question`}
    >
      <form onSubmit={handleSubmit}>
        <fieldset
          disabled={hasVoted || hasExpired || isSubmitting}
          className="poll-widget__fieldset"
        >
          <legend
            id={`poll-${currentPoll.id}-question`}
            className="poll-widget__question"
          >
            {currentPoll.question}
          </legend>

          {hasVoted ? (
            <PollResults
              options={currentPoll.options}
              totalVotes={totalVotes}
              userVoteOptionId={currentPoll.userVoteOptionId}
            />
          ) : (
            <PollOptions
              pollId={currentPoll.id}
              options={currentPoll.options}
              selectedOptionId={selectedOptionId}
              onSelect={setSelectedOptionId}
            />
          )}
        </fieldset>

        {!hasVoted && !hasExpired && (
          <button
            type="submit"
            disabled={!canSubmit}
            className="poll-widget__submit"
          >
            {isSubmitting ? "Submitting..." : "Submit vote"}
          </button>
        )}

        {hasExpired && (
          <p role="status" className="poll-widget__status">
            This poll has expired.
          </p>
        )}

        {error && (
          <p role="alert" className="poll-widget__error">
            {error}
          </p>
        )}

        <div aria-live="polite" className="poll-widget__sr-status">
          {status === "success" ? "Your vote was submitted." : ""}
        </div>
      </form>
    </section>
  );
}

function PollOptions({
  pollId,
  options,
  selectedOptionId,
  onSelect,
}) {
  return (
    <div className="poll-widget__options">
      {options.map((option) => (
        <label
          key={option.id}
          className="poll-widget__option"
        >
          <input
            type="radio"
            name={`poll-${pollId}`}
            value={option.id}
            checked={selectedOptionId === option.id}
            onChange={() => onSelect(option.id)}
          />

          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function PollResults({
  options,
  totalVotes,
  userVoteOptionId,
}) {
  return (
    <div
      className="poll-widget__results"
      aria-label="Poll results"
    >
      {options.map((option) => {
        const percentage =
          totalVotes === 0
            ? 0
            : Math.round(
              (option.voteCount / totalVotes) * 100
            );

        const isUserVote =
          option.id === userVoteOptionId;

        return (
          <div
            key={option.id}
            className="poll-widget__result"
          >
            <div className="poll-widget__result-header">
              <span>
                {option.label}
                {isUserVote ? " — your vote" : ""}
              </span>

              <span>
                {percentage}% · {option.voteCount}{" "}
                {option.voteCount === 1 ? "vote" : "votes"}
              </span>
            </div>

            <progress
              value={percentage}
              max="100"
              aria-label={`${option.label}: ${percentage}%`}
            >
              {percentage}%
            </progress>
          </div>
        );
      })}

      <p className="poll-widget__total">
        {totalVotes} total{" "}
        {totalVotes === 1 ? "vote" : "votes"}
      </p>
    </div>
  );
}

const initialPoll = {
  id: "poll-123",
  question: "What is your preferred frontend framework?",
  options: [
    {
      id: "react",
      label: "React",
      voteCount: 120,
    },
    {
      id: "vue",
      label: "Vue",
      voteCount: 50,
    },
    {
      id: "angular",
      label: "Angular",
      voteCount: 20,
    },
    {
      id: "svelte",
      label: "Svelte",
      voteCount: 10,
    },
  ],
  userVoteOptionId: null,
  expiresAt: "2026-08-01T00:00:00Z",
};

async function submitVote(pollId, optionId, signal) {
  const response = await fetch(
    `/api/polls/${pollId}/votes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({ optionId }),
      signal,
    }
  );

  if (!response.ok) {
    throw new Error("Vote submission failed.");
  }

  return response.json();
}

export function App() {
  return (
    <PollWidget
      poll={initialPoll}
      onVote={submitVote}
    />
  );
}