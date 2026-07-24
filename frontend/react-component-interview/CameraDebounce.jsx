import React, { useEffect, useRef, useState } from "react";

const SWITCH_DEBOUNCE_MS = 3000;
const SWITCH_THRESHOLD = 0.15;

export default function CameraCell({
  cell,
  camerasById,
  motionByCameraId
}) {
  const [activeCameraId, setActiveCameraId] = useState(
    cell.cameraIds[0] || null
  );

  const pendingCameraRef = useRef(null);
  const switchTimerRef = useRef(null);

  useEffect(() => {
    const winnerId = getHighestMotionCamera(
      cell.cameraIds,
      camerasById,
      motionByCameraId
    );

    if (!winnerId || winnerId === activeCameraId) {
      cancelPendingSwitch();
      return;
    }

    const activeScore =
      motionByCameraId[activeCameraId]?.score || 0;

    const winnerScore =
      motionByCameraId[winnerId]?.score || 0;

    // Do not switch for a small score difference.
    if (winnerScore < activeScore + SWITCH_THRESHOLD) {
      cancelPendingSwitch();
      return;
    }

    // The same winner is already waiting.
    if (pendingCameraRef.current === winnerId) {
      return;
    }

    // A different camera became the winner.
    // Restart the debounce timer.
    cancelPendingSwitch();

    pendingCameraRef.current = winnerId;

    switchTimerRef.current = window.setTimeout(() => {
      setActiveCameraId(winnerId);

      pendingCameraRef.current = null;
      switchTimerRef.current = null;
    }, SWITCH_DEBOUNCE_MS);

    return cancelPendingSwitch;
  }, [
    cell.cameraIds,
    camerasById,
    motionByCameraId,
    activeCameraId
  ]);

  function cancelPendingSwitch() {
    if (switchTimerRef.current) {
      window.clearTimeout(switchTimerRef.current);
    }

    switchTimerRef.current = null;
    pendingCameraRef.current = null;
  }

  const activeCamera = camerasById[activeCameraId];

  return (
    <article className="camera-cell">
      <header>
        <strong>{cell.title}</strong>
        <span>{activeCamera?.name || "No camera"}</span>
      </header>

      {activeCamera ? (
        <video
          key={activeCamera.id}
          src={activeCamera.streamUrl}
          autoPlay
          muted
          playsInline
        />
      ) : (
        <div>Camera unavailable</div>
      )}

      <footer>
        Motion:{" "}
        {motionByCameraId[activeCameraId]?.score?.toFixed(2) ??
          "—"}
      </footer>
    </article>
  );
}

function getHighestMotionCamera(
  cameraIds,
  camerasById,
  motionByCameraId
) {
  let winnerId = null;
  let highestScore = -1;

  for (const cameraId of cameraIds) {
    const camera = camerasById[cameraId];
    const motion = motionByCameraId[cameraId];

    if (!camera || camera.status === "offline") {
      continue;
    }

    const score = motion?.score || 0;

    if (score > highestScore) {
      highestScore = score;
      winnerId = cameraId;
    }
  }

  return winnerId;
}