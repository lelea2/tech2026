import {useEffect, useRef, useState} from 'react';
import './ModalSystem.css';

export default function ModalSystem() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open || !modalRef.current) return;

    const focusables = modalRef.current.querySelectorAll('button, input, a, [tabindex="0"]');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);

      if (event.key === 'Tab' && focusables.length > 0) {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="modal-demo">
      <h3>Modal/Dialog with Focus Trap</h3>
      <button onClick={() => setOpen(true)}>Open Modal</button>

      {open && (
        <div className="backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} ref={modalRef} role="dialog">
            <h4>Reservation Policy</h4>
            <p>Cancel free within 24 hours.</p>
            <input placeholder="Type note" />
            <div className="actions">
              <button onClick={() => setOpen(false)}>Cancel</button>
              <button onClick={() => setOpen(false)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
