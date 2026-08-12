import type { FormEvent } from "react";

import type { GameState } from "./gameReducer";

type DiveFormProps = Readonly<{
  state: GameState;
  onAnswer: (answer: string) => void;
  onSubmit: () => void;
}>;

export function DiveForm({ state, onAnswer, onSubmit }: DiveFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="dive-form" onSubmit={handleSubmit} aria-label="Submit an answer">
      <div className="timer-orbit" aria-live="polite" aria-label={`${state.remainingSeconds} seconds remaining`}>
        <span>{String(state.remainingSeconds).padStart(2, "0")}</span>
        <i aria-hidden="true" />
      </div>
      <label className="sr-only" htmlFor="answer-input">Your answer</label>
      <input
        id="answer-input"
        name="answer"
        autoComplete="off"
        autoFocus
        placeholder="type one answer…"
        value={state.answer}
        onChange={(event) => onAnswer(event.target.value)}
        disabled={state.phase === "submitting"}
        maxLength={120}
      />
      <button className="dive-submit" type="submit" disabled={!state.answer.trim() || state.phase === "submitting"}>
        {state.phase === "submitting" ? "LOGGING" : "DIVE"}
      </button>
      <div className="answer-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${state.remainingSeconds / 15})` }} />
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    </form>
  );
}
