import { useState } from 'react';
import styles from './ImageCarouselII.module.css';

export default function ImageCarousel({ images }) {
  // Three-state model: currentIndex = visible slot, nextIndex = incoming slot, isAnimating = CSS transition in flight.
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  if (images.length === 0) return null;

  const startTransition = (targetIndex) => {
    // Guard: reject if already animating, next slot already claimed, or target is the current slide.
    if (isAnimating || nextIndex !== null || targetIndex === currentIndex) {
      return;
    }

    // Mount the incoming image first, then trigger animation in the next frame.
    // Without rAF the browser hasn't painted the second image yet, so the CSS translate would skip.
    setNextIndex(targetIndex);

    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
  };

  const goPrev = () => {
    const targetIndex =
      currentIndex === 0 ? images.length - 1 : currentIndex - 1;

    // Still animate right-to-left.
    startTransition(targetIndex);
  };

  const goNext = () => {
    const targetIndex =
      currentIndex === images.length - 1 ? 0 : currentIndex + 1;

    startTransition(targetIndex);
  };

  const handleTransitionEnd = () => {
    if (nextIndex === null) return;

    // Commit state only after the CSS transition finishes — more reliable than setTimeout(duration).
    setCurrentIndex(nextIndex);
    setNextIndex(null);
    setIsAnimating(false);
  };

  // Two-slot technique: track holds [current, incoming] side by side; CSS translateX(-50%) slides to reveal incoming.
  const activeImage = images[currentIndex];
  const incomingImage = nextIndex !== null ? images[nextIndex] : null;

  return (
    <section className="carousel" aria-label="Image carousel">
      <div className="viewport">
        <div
          className={`track ${isAnimating ? 'trackSliding' : ''}`}
          onTransitionEnd={handleTransitionEnd}
        >
          <img
            className="image"
            src={activeImage.src}
            alt={activeImage.alt}
          />

          {incomingImage && (
            <img
              className="image"
              src={incomingImage.src}
              alt={incomingImage.alt}
            />
          )}
        </div>
      </div>

      {/* disabled during animation so clicks can't queue a second transition mid-flight. */}
      <button
        type="button"
        className="navButton leftButton"
        onClick={goPrev}
        disabled={isAnimating}
      >
        ‹
      </button>

      <button
        type="button"
        className="navButton rightButton"
        onClick={goNext}
        disabled={isAnimating}
      >
        ›
      </button>

      <div className="pageButtons">
        {/* key on src — not index — so React tracks identity correctly if the images array is reordered. */}
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            className={`pageButton ${
              index === currentIndex ? 'activePageButton' : ''
            }`}
            onClick={() => startTransition(index)}
            disabled={isAnimating}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </section>
  );
}
