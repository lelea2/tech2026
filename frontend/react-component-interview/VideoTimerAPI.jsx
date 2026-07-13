import { useEffect, useState } from "react";

function VideoTimeline({ getSnapshots }) {
  const [snapshots, setSnapshots] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let ignore = false;

    async function loadSnapshots() {
      try {
        setStatus("loading");

        const result = await getSnapshots();

        if (!ignore) {
          setSnapshots(result);
          setCurrentIndex(0);
          setStatus("success");
        }
      } catch {
        if (!ignore) {
          setStatus("error");
        }
      }
    }

    loadSnapshots();

    return () => {
      ignore = true;
    };
  }, [getSnapshots]);

  useEffect(() => {
    if (!isPlaying || snapshots.length === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentIndex((previousIndex) => {
        if (previousIndex >= snapshots.length - 1) {
          setIsPlaying(false);
          return previousIndex;
        }

        return previousIndex + 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPlaying, snapshots.length]);

  if (status === "loading") {
    return <p>Loading snapshots...</p>;
  }

  if (status === "error") {
    return <p role="alert">Failed to load snapshots.</p>;
  }

  if (snapshots.length === 0) {
    return <p>No snapshots available.</p>;
  }

  const currentSnapshot = snapshots[currentIndex];

  return (
    <div>
      <img
        src={currentSnapshot.image}
        alt={`Snapshot at ${currentSnapshot.time}`}
      />

      <button onClick={() => setIsPlaying((value) => !value)}>
        {isPlaying ? "Pause" : "Play"}
      </button>

      <div>
        {snapshots.map((snapshot, index) => (
          <button
            key={snapshot.index}
            onClick={() => setCurrentIndex(index)}
            aria-pressed={index === currentIndex}
          >
            {snapshot.time}
          </button>
        ))}
      </div>
    </div>
  );
}

const mockSnapshots: Snapshot[] = [
  {
    index: 0,
    timestamp: "10:00 AM",
    imageUrl: "https://placehold.co/640x360?text=10:00",
  },
  {
    index: 1,
    timestamp: "10:05 AM",
    imageUrl: "https://placehold.co/640x360?text=10:05",
  },
  {
    index: 2,
    timestamp: "10:10 AM",
    imageUrl: "https://placehold.co/640x360?text=10:10",
  },
];

async function fetchSnapshots(): Promise<Snapshot[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockSnapshots;
}

export default function App() {
  return <VideoTimeline getSnapshots={fetchSnapshots} />;
}