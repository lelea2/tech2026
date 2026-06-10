import { useState } from "react";
import "./styles.css";

// First question to ask is: what is the winning condition for a game of Tic Tac Toe?
// if the tictactoe board has three of the same symbols in a row, column, or diagonal, then that player wins.
// if it's a predefined grid, we could hard code the winning lines.
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board) {
  // return X or O if there is a winner, otherwise return null
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null)); // flat array of 9 null values
  const [isXTurn, setIsXTurn] = useState(true);  // true if it's X's turn, false if it's O's turn

  const winner = getWinner(board);
  const isDraw = !winner && board.every(Boolean);

  let status = `Player ${isXTurn ? "X" : "O"} turn`;

  if (winner) {
    status = `Player ${winner} wins!`;
  } else if (isDraw) {
    status = "Draw!";
  }

  const handleClick = (index) => {
    // if board is already filled or game is over, do nothing
    if (board[index] || winner) {
      return;
    }

    const nextBoard = [...board]; // update board with new index
    nextBoard[index] = isXTurn ? "X" : "O";

    setBoard(nextBoard);
    setIsXTurn(!isXTurn);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
  };

  return (
    <div className="app">
      <h1>Tic Tac Toe</h1>

      <h2>{status}</h2>

      <div className="board">
        {board.map((cell, index) => (
          <button
            key={index}
            className="cell"
            onClick={() => handleClick(index)}
          >
            {cell}
          </button>
        ))}
      </div>

      <button className="reset" onClick={resetGame}>
        Reset
      </button>
    </div>
  );
}
