import { useState } from "react";
import styles from "./styles.module.css";

const ROWS = 6;
const COLS = 7;

const EMPTY = null;
const PLAYER_ONE = "P1";
const PLAYER_TWO = "P2";

const PLAYERS = {
  [PLAYER_ONE]: {
    label: "Player 1",
    className: "red",
  },
  [PLAYER_TWO]: {
    label: "Player 2",
    className: "yellow",
  },
};

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

function getNextPlayer(player) {
  return player === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
}

function checkWinner(board, row, col, player) {
  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal down-right
    [1, -1], // diagonal down-left
  ];

  for (const [rowDir, colDir] of directions) {
    let count = 1;

    count += countPieces(board, row, col, rowDir, colDir, player);
    count += countPieces(board, row, col, -rowDir, -colDir, player);

    if (count >= 4) {
      return true;
    }
  }

  return false;
}

function countPieces(board, row, col, rowDir, colDir, player) {
  let count = 0;
  let nextRow = row + rowDir;
  let nextCol = col + colDir;

  while (
    nextRow >= 0 &&
    nextRow < ROWS &&
    nextCol >= 0 &&
    nextCol < COLS &&
    board[nextRow][nextCol] === player
  ) {
    count++;
    nextRow += rowDir;
    nextCol += colDir;
  }

  return count;
}

function isBoardFull(board) {
  return board.every((row) => row.every(Boolean));
}

export default function App() {
  const [board, setBoard] = useState(createBoard);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_ONE);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);

  const gameOver = winner || isDraw;

  function handleColumnClick(col) {
    if (gameOver) return;

    const nextBoard = board.map((row) => [...row]);

    let targetRow = -1;

    // Start from bottom row and find the first empty cell.
    for (let row = ROWS - 1; row >= 0; row--) {
      if (nextBoard[row][col] === EMPTY) {
        targetRow = row;
        break;
      }
    }

    // Column is full.
    if (targetRow === -1) return;

    nextBoard[targetRow][col] = currentPlayer;

    if (checkWinner(nextBoard, targetRow, col, currentPlayer)) {
      setBoard(nextBoard);
      setWinner(currentPlayer);
      return;
    }

    if (isBoardFull(nextBoard)) {
      setBoard(nextBoard);
      setIsDraw(true);
      return;
    }

    setBoard(nextBoard);
    setCurrentPlayer(getNextPlayer(currentPlayer));
  }

  function resetGame() {
    setBoard(createBoard());
    setCurrentPlayer(PLAYER_ONE);
    setWinner(null);
    setIsDraw(false);
  }

  return (
    <main className="app">
      <h1>Connect Four</h1>

      <p className="status">
        {winner
          ? `${PLAYERS[winner].label} wins!`
          : isDraw
            ? "It's a draw!"
            : `${PLAYERS[currentPlayer].label}'s turn`}
      </p>

      <div className="board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className="cell"
              onClick={() => handleColumnClick(colIndex)}
              aria-label={`Column ${colIndex + 1}`}
            >
              <span
                className={`disc ${
                  cell ? PLAYERS[cell].className : ""
                }`}
              />
            </button>
          ))
        )}
      </div>

      <button className="resetButton" onClick={resetGame}>
        Restart Game
      </button>
    </main>
  );
}
