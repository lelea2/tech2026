import { useEffect, useState } from "react";
import styles from "./App.module.css";

const DURATIONS = {
  red: 4000,
  yellow: 500,
  green: 3000,
};

const NEXT_LIGHT = {
  red: "green",
  green: "yellow",
  yellow: "red",
};

export default function App() {
  const [activeLight, setActiveLight] = useState("red");

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveLight(
        (current) => NEXT_LIGHT[current]
      );
    }, DURATIONS[activeLight]);

    return () => clearTimeout(timer);
  }, [activeLight]);

  return (
    <div className="wrapper">
      <div className="trafficLight">
        <div
          className={`light ${
            activeLight === "red" ? "redOn" : ""
          }`}
        />

        <div
          className={`light ${
            activeLight === "yellow"
              ? "yellowOn"
              : ""
          }`}
        />

        <div
          className={`light ${
            activeLight === "green"
              ? "greenOn"
              : ""
          }`}
        />
      </div>

      <div className="label">
        {activeLight.toUpperCase()}
      </div>
    </div>
  );
}
