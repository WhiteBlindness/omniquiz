import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { CSSProperties } from "react";

import { answerSecondsForMode, type GameState } from "./gameReducer";

type DiveFormProps = Readonly<{
  state: GameState;
  onAnswer: (answer: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  remainingMilliseconds: number;
}>;

const SWIPE_THRESHOLD = 60;

export function DiveForm({
  state,
  onAnswer,
  onSubmit,
  onPass,
  remainingMilliseconds,
}: DiveFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [swipeHint, setSwipeHint] = useState(false);

  useEffect(() => {
    if (state.phase === "answering") inputRef.current?.focus();
  }, [state.phase]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setSwipeHint(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    setSwipeHint(dx < -30);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    setSwipeHint(false);
    if (!touchStartRef.current || state.phase === "submitting") return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    touchStartRef.current = null;
    if (dx < -SWIPE_THRESHOLD && dy < 80) {
      onPass();
    }
  }, [state.phase, onPass]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape" && state.phase === "answering") {
        event.preventDefault();
        onPass();
      }
    },
    [state.phase, onPass],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const remainingSeconds = Math.max(0, Math.ceil(Math.max(0, remainingMilliseconds) / 1_000));
  const progress = Math.min(1, Math.max(0, remainingMilliseconds / (answerSecondsForMode(state.mode) * 1_000)));
  const isCritical = state.phase === "answering" && remainingMilliseconds > 0 && remainingSeconds <= 5;
  const urgencyLiveMode = remainingSeconds === 5 ? "assertive" as const : "off" as const;

  return (
    <form
      className={`dive-form ${swipeHint ? "swipe-hint" : ""}`}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Submit an answer"
      aria-busy={state.phase === "submitting"}
      aria-keyshortcuts="Enter Escape"
    >
      {isCritical ? (
        <p className="timer-urgency telemetry-data" role="status" aria-live={urgencyLiveMode} aria-atomic="true">
          {remainingSeconds} {remainingSeconds === 1 ? "second" : "seconds"} left
        </p>
      ) : null}
      <label className="sr-only" htmlFor="answer-input">Your answer</label>
      <input
        id="answer-input"
        name="answer"
        autoComplete="off"
        ref={inputRef}
        placeholder="type one answer…"
        value={state.answer}
        onChange={(event) => onAnswer(event.target.value)}
        disabled={state.phase === "submitting"}
        maxLength={120}
      />
      <button className="dive-submit" type="submit" disabled={!state.answer.trim() || state.phase === "submitting"}>
        {state.phase === "submitting" ? "LOGGING" : state.mode === "speed" || state.mode === "survival" ? "LOCK" : "DIVE"}
      </button>
      <button
        className="dive-pass"
        type="button"
        onClick={onPass}
        disabled={state.phase === "submitting"}
        title="Pass this prompt (Esc)"
      >
        PASS
      </button>
      <div className="answer-progress" aria-hidden="true">
        <span
          style={{
            transform: `scaleX(${progress})`,
            "--timer-progress": progress,
          } as CSSProperties}
        />
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <p className="form-shortcuts" aria-hidden="true">
        <span className="form-shortcuts-keyboard">ENTER TO SUBMIT · ESC TO PASS</span>
        <span className="form-shortcuts-touch">SWIPE LEFT TO PASS</span>
      </p>
    </form>
  );
}
