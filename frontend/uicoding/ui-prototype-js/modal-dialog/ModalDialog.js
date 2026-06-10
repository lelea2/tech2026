import { useId } from 'react';
import { createPortal } from 'react-dom';
import styles from "./styles.module.css";

export default function ModalDialog({
  open = false,
  ...props
}) {
  if (!open) {
    return null;
  }

  return <ModalDialogImpl {...props} />;
}

function ModalDialogImpl({
  children,
  title,
  onClose,
}) {
  const titleId = useId();
  const contentId = useId();

  return createPortal(
    <div className="modalOverlay">
      <div
        aria-describedby={contentId}
        aria-labelledby={titleId}
        className="modal"
        role="dialog">
        <h1 className="modalTitle" id={titleId}>
          {title}
        </h1>
        <div id={contentId}>{children}</div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body,
  );
}
