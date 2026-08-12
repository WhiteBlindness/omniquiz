import { useEffect, useRef } from "react";
import type { FormEvent } from "react";

import { ANSWER_SECONDS, type GameState } from "./gameReducer";

type DiveFormProps = Readonly<{
  state: GameState;
  onAnswer: (answer: string) => void;
  onSubmit: () => void;
  onPass: () => void;
}>;

export function DiveForm({ state, onAnswer, onSubmit, onPass }: DiveFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.phase === "answering") inputRef.current?.focus();
  }, [state.phase]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const isCritical = state.phase === "answering" && state.remainingSeconds <= 5;
  const urgencyLiveMode = state.remainingSeconds === 5 ? "polite" : "off";

  return (
    <form
      className="dive-form"
      onSubmit={handleSubmit}
      aria-label="Submit an answer"
      aria-busy={state.phase === "submitting"}
      aria-keyshortcuts="Enter"
    >
      {isCritical ? (
        <p className="timer-urgency" role="status" aria-live={urgencyLiveMode} aria-atomic="true">
          {state.remainingSeconds} seconds left
        </p>
      ) : null}
      <label className="sr-only" htmlFor="answer-input">Your answer</label>
      <input
        id="answer-input"
        name="answer"
        autoComplete="off"
        autoFocus
        ref={inputRef}
        placeholder="type one answer…"
        value={state.answer}
        onChange={(event) => onAnswer(event.target.value)}
        disabled={state.phase === "submitting"}
        maxLength={120}
      />
      <button className="dive-submit" type="submit" disabled={!state.answer.trim() || state.phase === "submitting"}>
        {state.phase === "submitting" ? "LOGGING" : "DIVE"}
      </button>
      <button
        className="dive-pass"
        type="button"
        onClick={onPass}
        disabled={state.phase === "submitting"}
      >
        PASS
      </button>
      <div className="answer-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(0, state.remainingSeconds / ANSWER_SECONDS)})` }} />
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    </form>
  );
}
