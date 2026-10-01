"use client";

import { useEffect, useRef } from "react";

type ExitConfirmProps = Readonly<{
  onStay: () => void;
  onLeave: () => void;
}>;

export function ExitConfirm({ onStay, onLeave }: ExitConfirmProps) {
  const stayRef = useRef<HTMLButtonElement>(null);
  const leaveRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    stayRef.current?.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onStay();
      return;
    }
    if (event.key === "Tab") {
      const first = stayRef.current;
      const last = leaveRef.current;
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div className="exit-confirm-scrim" onKeyDown={handleKeyDown}>
      <div
        className="exit-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="exit-confirm-title"
        aria-describedby="exit-confirm-copy"
      >
        <h2 id="exit-confirm-title">Leave this run?</h2>
        <p id="exit-confirm-copy">
          It stays saved in this browser until you start another run, but the answer clock keeps
          running while you are away.
        </p>
        <div className="exit-confirm-actions">
          <button ref={stayRef} className="exit-confirm-stay" type="button" onClick={onStay}>
            KEEP PLAYING
          </button>
          <button ref={leaveRef} className="exit-confirm-leave" type="button" onClick={onLeave}>
            LEAVE RUN
          </button>
        </div>
      </div>
    </div>
  );
}
