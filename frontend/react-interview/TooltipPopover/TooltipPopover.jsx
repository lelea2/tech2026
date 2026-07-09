import {useState} from 'react';
import './TooltipPopover.css';

export default function TooltipPopover() {
  const [open, setOpen] = useState(false);

  return (
    <div className="tooltip-demo">
      <h3>Tooltip / Popover</h3>
      <div className="anchor-wrap">
        <button
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          Hover or focus me
        </button>
        {open && <div className="popover">This is a simple positioned popover.</div>}
      </div>
    </div>
  );
}
