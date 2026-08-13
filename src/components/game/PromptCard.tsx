import type { GamePhase, GameState } from "./gameReducer";

type PromptCardProps = Readonly<{
  state: GameState;
  phase: GamePhase;
}>;

export function PromptCard({ state, phase }: PromptCardProps) {
  const question = state.questions[state.questionIndex];
  if (!question) return null;

  const preview = phase === "preview";
  return (
    <section className={`prompt-card ${preview ? "prompt-card-preview" : ""}`} aria-labelledby="current-prompt">
      <span className="sr-only">Prompt {state.questionIndex + 1} of {state.questions.length}</span>
      <h1 id="current-prompt">{question.prompt}</h1>
      <p className="rarity-hint">Name the first honest answer that surfaces. Rarer recognizable signals sink deeper.</p>
      {preview ? (
        <p className="preview-countdown" aria-live="polite">
          DESCENT BEGINS IN <strong>{state.previewSeconds}</strong>
        </p>
      ) : (
        <p className="prompt-category">{question.category.toUpperCase()} / CROWD ATLAS</p>
      )}
    </section>
  );
}
