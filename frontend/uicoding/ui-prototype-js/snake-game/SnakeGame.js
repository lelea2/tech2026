import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './SnakeGame.module.css';

const GRID_SIZE = 15;
const GAME_SPEED = 150;

const INITIAL_SNAKE = [
  { row: 7, col: 7 },
  { row: 7, col: 6 },
  { row: 7, col: 5 },
];

const INITIAL_DIRECTION = 'RIGHT';

function isSamePosition(a, b) {
  return a.row === b.row && a.col === b.col;
}

function isPositionInSnake(position, snake) {
  return snake.some((segment) => isSamePosition(segment, position));
}

function getRandomApplePosition(snake) {
  while (true) {
    const apple = {
      row: Math.floor(Math.random() * GRID_SIZE),
      col: Math.floor(Math.random() * GRID_SIZE),
    };

    if (!isPositionInSnake(apple, snake)) {
      return apple;
    }
  }
}

function getNextHead(head, direction) {
  switch (direction) {
    case 'UP':
      return { row: head.row - 1, col: head.col };
    case 'DOWN':
      return { row: head.row + 1, col: head.col };
    case 'LEFT':
      return { row: head.row, col: head.col - 1 };
    case 'RIGHT':
      return { row: head.row, col: head.col + 1 };
    default:
      return head;
  }
}

function isOppositeDirection(current, next) {
  return (
    (current === 'UP' && next === 'DOWN') ||
    (current === 'DOWN' && next === 'UP') ||
    (current === 'LEFT' && next === 'RIGHT') ||
    (current === 'RIGHT' && next === 'LEFT')
  );
}

function isOutOfBounds(position) {
  return (
    position.row < 0 ||
    position.row >= GRID_SIZE ||
    position.col < 0 ||
    position.col >= GRID_SIZE
  );
}

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [apple, setApple] = useState(() =>
    getRandomApplePosition(INITIAL_SNAKE),
  );
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Refs help the interval always read the latest direction/game state.
  const directionRef = useRef(direction);
  const gameOverRef = useRef(isGameOver);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    gameOverRef.current = isGameOver;
  }, [isGameOver]);

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key.toLowerCase();

      let nextDirection = null;

      if (key === 'arrowup' || key === 'w') nextDirection = 'UP';
      if (key === 'arrowdown' || key === 's') nextDirection = 'DOWN';
      if (key === 'arrowleft' || key === 'a') nextDirection = 'LEFT';
      if (key === 'arrowright' || key === 'd') nextDirection = 'RIGHT';

      if (!nextDirection) return;

      setDirection((currentDirection) => {
        // Prevent instantly reversing into yourself.
        if (isOppositeDirection(currentDirection, nextDirection)) {
          return currentDirection;
        }

        return nextDirection;
      });
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isGameOver) return;

    const intervalId = window.setInterval(() => {
      setSnake((currentSnake) => {
        const currentHead = currentSnake[0];
        const nextHead = getNextHead(currentHead, directionRef.current);

        const hitWall = isOutOfBounds(nextHead);
        const hitBody = isPositionInSnake(nextHead, currentSnake);

        if (hitWall || hitBody) {
          setIsGameOver(true);
          return currentSnake;
        }

        const ateApple = isSamePosition(nextHead, apple);

        const nextSnake = ateApple
          ? [nextHead, ...currentSnake]
          : [nextHead, ...currentSnake.slice(0, -1)];

        if (ateApple) {
          setScore((currentScore) => currentScore + 1);
          setApple(getRandomApplePosition(nextSnake));
        }

        return nextSnake;
      });
    }, GAME_SPEED);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [apple, isGameOver]);

  const cells = useMemo(() => {
    const result = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        result.push({ row, col });
      }
    }

    return result;
  }, []);

  function restartGame() {
    setSnake(INITIAL_SNAKE);
    setApple(getRandomApplePosition(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
  }

  return (
    <main className="container">
      <h1>Snake Game</h1>

      <div className="header">
        <p className="score">Score: {score}</p>

        {isGameOver && (
          <button className="restartButton" onClick={restartGame}>
            Restart
          </button>
        )}
      </div>

      {isGameOver && <p className="gameOver">Game Over</p>}

      <div className="board">
        {cells.map((cell) => {
          const isSnakeHead = isSamePosition(cell, snake[0]);
          const isSnakeBody = snake
            .slice(1)
            .some((segment) => isSamePosition(segment, cell));
          const isApple = isSamePosition(cell, apple);

          let className = "cell";

          if (isSnakeHead) className += " snakeHead";
          else if (isSnakeBody) className += " snakeBody";
          else if (isApple) className += " apple";

          return (
            <div
              key={`${cell.row}-${cell.col}`}
              className={className}
              aria-label={`row ${cell.row}, column ${cell.col}`}
            />
          );
        })}
      </div>

      <p className="instructions">
        Use arrow keys or WASD to move.
      </p>
    </main>
  );
}
