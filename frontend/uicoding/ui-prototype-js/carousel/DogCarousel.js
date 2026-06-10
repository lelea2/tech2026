import { useEffect, useState } from "react";
import { getDogs } from "./dogapi";
import styles from "./DogCarousel.module.css";

const DOG_LIMIT = 10;

export default function DogCarousel() {
  const [dogs, setDogs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fetchState, setFetchState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const totalDogs = dogs.length;
  const currentDog = dogs[currentIndex];

  const goToSlide = (index) => {
    if (totalDogs === 0) return;

    // Wrap around:
    // - index after last goes back to first
    // - index before first goes to last
    const nextIndex = (index + totalDogs) % totalDogs;

    // update current index, only render active image
    setCurrentIndex(nextIndex);
  };

  const goToPrevious = () => {
    goToSlide(currentIndex - 1);
  };

  const goToNext = () => {
    goToSlide(currentIndex + 1);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadDogs() {
      try {
        setFetchState("loading");
        setErrorMessage("");

        const dogResults = await getDogs(DOG_LIMIT);

        if (!isMounted) return;

        setDogs(dogResults);
        setCurrentIndex(0);
        setFetchState(dogResults.length > 0 ? "success" : "empty");
      } catch (error) {
        if (!isMounted) return;

        setFetchState("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading dogs."
        );
      }
    }

    loadDogs();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        goToPrevious();
      }

      if (event.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, totalDogs]);

  if (fetchState === "loading") {
    return (
      <main className="page">
        <section className="carouselCard">
          <p className="statusText">Loading cute dogs...</p>
        </section>
      </main>
    );
  }

  if (fetchState === "error") {
    return (
      <main className="page">
        <section className="carouselCard">
          <h1 className="title">Could not load dogs</h1>
          <p className="statusText">{errorMessage}</p>
        </section>
      </main>
    );
  }

  if (fetchState === "empty") {
    return (
      <main className="page">
        <section className="carouselCard">
          <h1 className="title">No dogs found</h1>
          <p className="statusText">Please try again later.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section
        className="carouselCard"
        aria-label="Dogs with jobs slideshow"
        aria-roledescription="carousel"
      >
        <header className="carouselHeader">
          <div>
            <p className="eyebrow">/r/dogswithjobs</p>
            <h1 className="title">Top Dogs With Jobs</h1>
          </div>

          <p className="counter">
            {currentIndex + 1} / {totalDogs}
          </p>
        </header>

        <div className="carousel">
          <button
            type="button"
            className="navButton navButtonLeft"
            aria-label="Previous dog"
            onClick={goToPrevious}
          >
            ‹
          </button>

          <figure className="slide">
            <img
              className="slideImage"
              src={currentDog.url}
              alt={currentDog.title}
            />

            <figcaption className="caption">
              <h2>{currentDog.title}</h2>
              <p>Use the arrow buttons, keyboard arrows, or dots to navigate.</p>
            </figcaption>
          </figure>

          <button
            type="button"
            className="navButton navButtonRight"
            aria-label="Next dog"
            onClick={goToNext}
          >
            ›
          </button>
        </div>

        <div className="dots" aria-label="Carousel pagination">
          {dogs.map((dog, index) => (
            <button
              key={`${dog.title}-${dog.url}`}
              type="button"
              className={
                index === currentIndex
                  ? "dot dotActive"
                  : "dot"
              }
              aria-label={`Go to dog ${index + 1}`}
              aria-current={index === currentIndex}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
