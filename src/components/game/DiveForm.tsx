import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import type { CSSProperties } from "react";

import { ANSWER_SECONDS, type GameState } from "./gameReducer";

type DiveFormProps = Readonly<{
  state: GameState;
  onAnswer: (answer: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  remainingMilliseconds: number;
}>;

export function DiveForm({
  state,
  onAnswer,
  onSubmit,
  onPass,
  remainingMilliseconds,
}: DiveFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.phase === "answering") inputRef.current?.focus();
  }, [state.phase]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const remainingSeconds = Math.max(0, Math.ceil(Math.max(0, remainingMilliseconds) / 1_000));
  const progress = Math.min(1, Math.max(0, remainingMilliseconds / (ANSWER_SECONDS * 1_000)));
  const isCritical = state.phase === "answering" && remainingMilliseconds > 0 && remainingSeconds <= 5;
  const urgencyLiveMode = remainingSeconds === 5 ? "polite" : "off";

  return (
    <form
      className="dive-form"
      onSubmit={handleSubmit}
      aria-label="Submit an answer"
      aria-busy={state.phase === "submitting"}
      aria-keyshortcuts="Enter"
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
        <span
          style={{
            transform: `scaleX(${progress})`,
            "--timer-progress": progress,
          } as CSSProperties}
        />
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    </form>
  );
}
