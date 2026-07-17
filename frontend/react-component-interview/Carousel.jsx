import { useEffect, useState } from "react";

const images = [
  { url: "image-1.jpg", duration: 5000 },
  { url: "image-2.jpg", duration: 3000 },
  { url: "image-3.jpg", duration: 4000 },
];

export default function Slideshow() {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(images[0].duration);

  useEffect(() => {
    setRemaining(images[index].duration);

    const timer = setInterval(() => {
      setRemaining((time) => {
        const nextTime = time - 100;

        if (nextTime <= 0) {
          clearInterval(timer);

          if (index < images.length - 1) {
            setIndex(index + 1);
          }

          return 0;
        }

        return nextTime;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [index]);

  const seconds = Math.floor(remaining / 1000);
  const milliseconds = String(remaining % 1000).padStart(3, "0");

  return (
    <div>
      <img
        src={images[index].url}
        alt={`Slide ${index + 1}`}
        width="500"
      />

      <p>
        Remaining: {seconds}:{milliseconds}
      </p>
    </div>
  );
}

// CSS
// .slideshow {
//   max-width: 800px;
//   margin: 0 auto;
//   text-align: center;
// }

// .image-container {
//   position: relative;
//   aspect-ratio: 16 / 9;
//   overflow: hidden;
//   background: #111;
// }

// .image-container img {
//   width: 100%;
//   height: 100%;
//   object-fit: cover;
// }

// .countdown {
//   position: absolute;
//   right: 16px;
//   bottom: 16px;
//   padding: 8px 12px;
//   border-radius: 6px;
//   background: rgb(0 0 0 / 70%);
//   color: white;
//   font-family: monospace;
//   font-size: 20px;
// }

import { useEffect, useState } from "react";

const images = [
  {
    url: "https://picsum.photos/id/10/800/450",
    duration: 5000,
  },
  {
    url: "https://picsum.photos/id/20/800/450",
    duration: 3000,
  },
  {
    url: "https://picsum.photos/id/30/800/450",
    duration: 4500,
  },
];

const TICK_INTERVAL = 100;

function formatRemainingTime(milliseconds) {
  const safeTime = Math.max(0, milliseconds);
  const seconds = Math.floor(safeTime / 1000);
  const hundredths = Math.floor((safeTime % 1000) / 10);

  return `${seconds}:${String(hundredths).padStart(2, "0")}`;
}

export default function Slideshow({ items = images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(
    items[0]?.duration ?? 0
  );

  const currentImage = items[currentIndex];
  const isLastImage = currentIndex === items.length - 1;

  useEffect(() => {
    if (!currentImage) return;

    setRemainingTime(currentImage.duration);

    const startedAt = Date.now();
    const endsAt = startedAt + currentImage.duration;

    const intervalId = window.setInterval(() => {
      const nextRemainingTime = Math.max(0, endsAt - Date.now());

      setRemainingTime(nextRemainingTime);

      if (nextRemainingTime === 0) {
        window.clearInterval(intervalId);

        if (!isLastImage) {
          setCurrentIndex((index) => index + 1);
        }
      }
    }, TICK_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentIndex, currentImage, isLastImage]);

  if (!currentImage) {
    return <p>No images available.</p>;
  }

  return (
    <div className="slideshow">
      <div className="image-container">
        <img
          src={currentImage.url}
          alt={`Slide ${currentIndex + 1}`}
        />

        <output className="countdown" aria-live="off">
          {formatRemainingTime(remainingTime)}
        </output>
      </div>

      <p>
        Image {currentIndex + 1} of {items.length}
      </p>
    </div>
  );
}