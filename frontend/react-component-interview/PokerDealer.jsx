import { useState } from "react";
import "./PokerDealer.css";

const SUITS = [
  { symbol: "♠", name: "spades" },
  { symbol: "♥", name: "hearts" },
  { symbol: "♦", name: "diamonds" },
  { symbol: "♣", name: "clubs" },
];

const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

function createDeck() {
  return SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      id: `${rank}-${suit.name}`,
      rank,
      suit: suit.symbol,
      suitName: suit.name,
    }))
  );
}

function shuffle(cards) {
  const result = [...cards];

  // Fisher–Yates shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [result[i], result[randomIndex]] = [
      result[randomIndex],
      result[i],
    ];
  }

  return result;
}

function Card({ card }) {
  const isRed =
    card.suitName === "hearts" || card.suitName === "diamonds";

  return (
    <div
      className={`card ${isRed ? "card--red" : "card--black"}`}
      aria-label={`${card.rank} of ${card.suitName}`}
    >
      <div className="card__corner card__corner--top">
        <span>{card.rank}</span>
        <span>{card.suit}</span>
      </div>

      <div className="card__suit">{card.suit}</div>

      <div className="card__corner card__corner--bottom">
        <span>{card.rank}</span>
        <span>{card.suit}</span>
      </div>
    </div>
  );
}

export default function PokerDealer() {
  const [deck, setDeck] = useState(() => shuffle(createDeck()));
  const [hand, setHand] = useState([]);

  function dealCard() {
    if (deck.length === 0) {
      return;
    }

    const [nextCard, ...remainingDeck] = deck;

    setDeck(remainingDeck);
    setHand((currentHand) => [...currentHand, nextCard]);
  }

  function dealFiveCards() {
    const cardsToDeal = Math.min(5, deck.length);

    if (cardsToDeal === 0) {
      return;
    }

    const nextHand = deck.slice(0, cardsToDeal);
    const remainingDeck = deck.slice(cardsToDeal);

    setDeck(remainingDeck);
    setHand((currentHand) => [...currentHand, ...nextHand]);
  }

  function resetGame() {
    setDeck(shuffle(createDeck()));
    setHand([]);
  }

  return (
    <main className="poker-table">
      <h1>Poker Card Dealer</h1>

      <div className="controls">
        <button onClick={dealCard} disabled={deck.length === 0}>
          Deal one
        </button>

        <button onClick={dealFiveCards} disabled={deck.length === 0}>
          Deal five
        </button>

        <button onClick={resetGame}>Reset and shuffle</button>
      </div>

      <p>
        Cards remaining: <strong>{deck.length}</strong>
      </p>

      <section aria-label="Dealt cards">
        <h2>Your hand</h2>

        {hand.length === 0 ? (
          <p>No cards dealt yet.</p>
        ) : (
          <div className="hand">
            {hand.map((card) => (
              <Card key={card.id} card={card} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}



/** CSS */
// * {
//   box-sizing: border-box;
// }

// body {
//   margin: 0;
//   font-family: Arial, sans-serif;
//   background: #08752f;
// }

// button {
//   padding: 10px 16px;
//   border: 0;
//   border-radius: 6px;
//   cursor: pointer;
//   font-size: 16px;
// }

// button:disabled {
//   cursor: not-allowed;
//   opacity: 0.5;
// }

// .poker-table {
//   min-height: 100vh;
//   padding: 32px;
//   color: white;
// }

// .controls {
//   display: flex;
//   flex-wrap: wrap;
//   gap: 12px;
//   margin-bottom: 20px;
// }

// .hand {
//   display: flex;
//   flex-wrap: wrap;
//   gap: 16px;
// }

// .card {
//   position: relative;
//   width: 120px;
//   height: 168px;
//   border: 1px solid #ccc;
//   border-radius: 10px;
//   background: white;
//   box-shadow: 0 4px 10px rgb(0 0 0 / 25%);
//   user-select: none;
// }

// .card--red {
//   color: #d21f2b;
// }

// .card--black {
//   color: #111;
// }

// .card__corner {
//   position: absolute;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   font-size: 20px;
//   font-weight: bold;
//   line-height: 1;
// }

// .card__corner--top {
//   top: 10px;
//   left: 10px;
// }

// .card__corner--bottom {
//   right: 10px;
//   bottom: 10px;
//   transform: rotate(180deg);
// }

// .card__suit {
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   font-size: 52px;
//   transform: translate(-50%, -50%);
// }