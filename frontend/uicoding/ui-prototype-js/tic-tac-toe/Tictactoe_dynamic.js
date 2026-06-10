import { useState } from "react";
import "./styles.css";

const BOARD_SIZE = 5; // N
const WIN_LENGTH = 4; // M

export default function App() {
  // Initialize the game board
  // Create a 2D array of size BOARD_SIZE x BOARD_SIZE, filled with null values
  const [board, setBoard] = useState(
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState("X");

  const winner = getWinner(board); // return string (X or O) if there is a winner, otherwise return null
  const isDraw = !winner && board.flat().every(Boolean);

  function handleClick(row, col) {
    if (board[row][col] || winner) {
      return;
    }

    const nextBoard = board.map((r) => [...r]); // clone the board
    nextBoard[row][col] = currentPlayer;

    setBoard(nextBoard);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  }

  function resetGame() {
    setBoard(
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null))
    );
    setCurrentPlayer("X");
  }

  function getStatus() {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "Draw!";
    return `Current player: ${currentPlayer}`;
  }

  return (
    <div className="app">
      <h1>{getStatus()}</h1>

      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 60px)`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className="cell"
              onClick={() => handleClick(rowIndex, colIndex)}
            >
              {cell}
            </button>
          ))
        )}
      </div>

      <button className="reset" onClick={resetGame}>
        Reset
      </button>
    </div>
  );
}

function getWinner(board) {
  const directions = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal down-right
    [1, -1], // diagonal down-left
  ];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const player = board[row][col];
      if (!player) continue;

      // Check all possible winning directions from this position
      // For each direction, check if there are enough consecutive pieces
      for (const [rowDir, colDir] of directions) {
        let count = 1;

        // For each direction, loop through the board
        // starting from the current position and moving in the specified direction
        for (let step = 1; step < WIN_LENGTH; step++) {
          const nextRow = row + rowDir * step;
          const nextCol = col + colDir * step;

          if (
            nextRow < 0 ||
            nextRow >= BOARD_SIZE ||
            nextCol < 0 ||
            nextCol >= BOARD_SIZE ||
            board[nextRow][nextCol] !== player
          ) {
            break;
          }

          count++;
        }

        if (count === WIN_LENGTH) {
          return player;
        }
      }
    }
  }

  return null;
}
