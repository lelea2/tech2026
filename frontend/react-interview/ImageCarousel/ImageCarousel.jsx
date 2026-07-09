import {useState} from 'react';
import './ImageCarousel.css';

const IMAGES = [
  'https://picsum.photos/id/1018/800/400',
  'https://picsum.photos/id/1025/800/400',
  'https://picsum.photos/id/1035/800/400',
  'https://picsum.photos/id/1043/800/400',
];

export default function ImageCarousel({images = IMAGES}) {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="carousel">
      <h3>Image Carousel</h3>
      <div className="frame">
        <button onClick={prev} aria-label="Previous image">
          {'<'}
        </button>
        <img src={images[index]} alt={`Slide ${index + 1}`} />
        <button onClick={next} aria-label="Next image">
          {'>'}
        </button>
      </div>
      <p>
        {index + 1} / {images.length}
      </p>
    </div>
  );
}
