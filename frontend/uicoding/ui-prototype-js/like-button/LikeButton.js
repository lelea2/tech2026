import { useState } from "react";
import { HeartIcon, SpinnerIcon } from "./icons";
import "./styles.css";

const API_URL =
  "https://questions.greatfrontend.com/api/questions/like-button";

export default function App() {
  const [status, setStatus] = useState("default");
  const [error, setError] = useState("");

  const isLiked = status === "liked";
  const isLoading = status === "loading";

  async function handleClick() {
    if (isLoading) return;

    const previousStatus = status;
    const action = isLiked ? "unlike" : "like";

    setStatus("loading");
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setStatus(action === "like" ? "liked" : "default");
    } catch (err) {
      setStatus(previousStatus);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  return (
    <div>
      <button
        className={`like-button ${isLiked ? "liked" : ""}`}
        disabled={isLoading}
        onClick={handleClick}
        aria-pressed={isLiked}
      >
        {isLoading ? <SpinnerIcon /> : <HeartIcon />}
        {isLiked ? "Liked" : "Like"}
      </button>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
