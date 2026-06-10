import { useId, useState } from 'react';
import styles from './Toggle.module.css';

export function Toggle({
  label,
  size = 'medium',
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  showLabel = false,
}) {
  const id = useId();

  /**
   * If `checked` is provided, the component is controlled.
   * Otherwise, it manages its own internal state.
   */
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const isChecked = isControlled ? checked : internalChecked;

  function handleToggle() {
    if (disabled) return;

    const nextChecked = !isChecked;

    if (!isControlled) {
      setInternalChecked(nextChecked);
    }

    onChange?.(nextChecked);
  }

  return (
    <div className="wrapper">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-label={label}
        disabled={disabled}
        className={[
          "toggle",
          size,
          isChecked ? "checked" : "unchecked",
        ].join(' ')}
        onClick={handleToggle}
      >
        <span className="thumb" />
      </button>

      {showLabel && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
    </div>
  );
}
