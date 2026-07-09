import {useRef, useState} from 'react';
import './ToastSystem.css';

export default function ToastSystem() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  const pushToast = () => {
    const id = idRef.current++;
    const toast = {id, message: `Saved successfully (${id})`};
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2500);
  };

  return (
    <div className="toast-demo">
      <h3>Toast Notification System</h3>
      <button onClick={pushToast}>Show Toast</button>

      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-item">
            <span>{toast.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}>x</button>
          </div>
        ))}
      </div>
    </div>
  );
}
