import { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";

const WORDS = ["APPLE", "GRAPE", "MANGO", "PLANT", "BRAVE", "CRANE"];
const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function scoreGuess(guess, answer) {
  const statuses = Array(WORD_LENGTH).fill("absent");
  const letterCount = {};

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      statuses[i] = "correct";
    } else {
      letterCount[answer[i]] = (letterCount[answer[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (statuses[i] === "correct") continue;

    const letter = guess[i];

    if (letterCount[letter] > 0) {
      statuses[i] = "present";
      letterCount[letter]--;
    }
  }

  return statuses;
}

export default function App() {
  const [answer, setAnswer] = useState(() => getRandomWord());
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");

  const isWon = guesses.some((guess) => guess.word === answer);
  const isLost = guesses.length === MAX_ATTEMPTS && !isWon;
  const isGameOver = isWon || isLost;

  const message = useMemo(() => {
    if (isWon) return "You won!";
    if (isLost) return `You lost! Answer: ${answer}`;
    return "Guess the word";
  }, [isWon, isLost, answer]);

  function submitGuess() {
    if (currentGuess.length !== WORD_LENGTH || isGameOver) return;

    const guess = currentGuess.toUpperCase();

    setGuesses((prev) => [
      ...prev,
      {
        word: guess,
        statuses: scoreGuess(guess, answer),
      },
    ]);

    setCurrentGuess("");
  }

  function resetGame() {
    setAnswer(getRandomWord());
    setGuesses([]);
    setCurrentGuess("");
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (isGameOver) return;

      const key = event.key;

      if (key === "Enter") {
        submitGuess();
        return;
      }

      if (key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (/^[a-zA-Z]$/.test(key)) {
        setCurrentGuess((prev) => {
          if (prev.length >= WORD_LENGTH) return prev;
          return prev + key.toUpperCase();
        });
      }
    }

    // event listener for handle keydown
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, isGameOver]);

  const rows = Array.from({ length: MAX_ATTEMPTS }, (_, rowIndex) => {
    const submittedGuess = guesses[rowIndex];

    if (submittedGuess) {
      return {
        letters: submittedGuess.word.split(""),
        statuses: submittedGuess.statuses,
      };
    }

    if (rowIndex === guesses.length) {
      return {
        letters: currentGuess.padEnd(WORD_LENGTH).split(""),
        statuses: Array(WORD_LENGTH).fill("default"),
      };
    }

    return {
      letters: Array(WORD_LENGTH).fill(""),
      statuses: Array(WORD_LENGTH).fill("default"),
    };
  });

  return (
    <main className="app">
      <h1>Wordle</h1>
      <p>{message}</p>

      <div className="board">
        {rows.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.letters.map((letter, colIndex) => (
              <div
                key={colIndex}
                className={`tile ${row.statuses[colIndex]}`}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      {!isGameOver && (
        <button
          className="button"
          onClick={submitGuess}
          disabled={currentGuess.length !== WORD_LENGTH}
        >
          Enter
        </button>
      )}

      {isGameOver && <button className="button" onClick={resetGame}>Reset</button>}
    </main>
  );
}
