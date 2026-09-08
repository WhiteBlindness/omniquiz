import type { CSSProperties } from "react";

import { PREVIEW_SECONDS, type GamePhase, type GameState } from "./gameReducer";

type PromptCardProps = Readonly<{
  state: GameState;
  phase: GamePhase;
}>;

export function PromptCard({ state, phase }: PromptCardProps) {
  const question = state.questions[state.questionIndex];
  if (!question) return null;

  const preview = phase === "preview";
  const countdownProgress = preview ? state.previewSeconds / PREVIEW_SECONDS : 0;

  return (
    <section className={`prompt-card ${preview ? "prompt-card-preview" : ""}`} aria-labelledby="current-prompt">
      <span className="sr-only">Prompt {state.questionIndex + 1} of {state.questions.length}</span>
      <h1 id="current-prompt">{question.prompt}</h1>
      <p className="rarity-hint">Name the first honest answer that surfaces. Rarer recognizable signals sink deeper.</p>
      {preview ? (
        <div className="preview-countdown" aria-live="polite">
          <svg
            className="countdown-ring"
            viewBox="0 0 40 40"
            aria-hidden="true"
            style={{ "--countdown-progress": countdownProgress } as CSSProperties}
          >
            <circle className="countdown-ring-track" cx="20" cy="20" r="17" />
            <circle className="countdown-ring-fill" cx="20" cy="20" r="17" />
          </svg>
          <span className="countdown-digit" key={state.previewSeconds}>{state.previewSeconds}</span>
        </div>
      ) : (
        <p className="prompt-category">{question.category.toUpperCase()} / CROWD ATLAS</p>
      )}
    </section>
  );
}
