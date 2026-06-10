import { useEffect, useState } from "react";
import "./styles.css";

const emojis = [
  "🐵", "🐶", "🦊", "🐱", "🦁", "🐯",
  "🐴", "🦄", "🦓", "🦌", "🐮", "🐷",
];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function createCards() {
  return shuffle([...emojis, ...emojis]).map((emoji, index) => ({ id: index, emoji }));
}

export default function App() {
  const [cards, setCards] = useState(createCards);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);

  function startGame() {
    setCards(createCards());
    setSelected([]);
    setMatched([]);
  }

  useEffect(() => {
    if (selected.length !== 2) return;

    const [first, second] = selected;
    const isMatch = first.emoji === second.emoji;
    const delay = isMatch ? 0 : 1000;

    const timer = setTimeout(() => {
      if (isMatch) {
        setMatched((prev) => [...prev, first.id, second.id]);
      }
      setSelected([]);
    }, delay);

    return () => clearTimeout(timer);
  }, [selected]);

  function handleCardClick(card) {
    if (selected.length === 2) {
      setSelected([card]);
      return;
    }

    if (
      selected.some((selectedCard) => selectedCard.id === card.id) ||
      matched.includes(card.id)
    ) {
      return;
    }

    setSelected((prev) => [...prev, card]);
  }

  const isGameOver = cards.length > 0 && matched.length === cards.length;

  return (
    <div className="app">
      <h1>Memory Game</h1>

      <div className="grid">
        {cards.map((card) => {
          const isFlipped =
            selected.some((selectedCard) => selectedCard.id === card.id) ||
            matched.includes(card.id);

          return (
            <button
              key={card.id}
              className={`card ${isFlipped ? "flipped" : ""}`}
              onClick={() => handleCardClick(card)}
            >
              {isFlipped ? card.emoji : "❓"}
            </button>
          );
        })}
      </div>

      {isGameOver && (
        <button className="play-again" onClick={startGame}>
          Play again
        </button>
      )}
    </div>
  );
}
