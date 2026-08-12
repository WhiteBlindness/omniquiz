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
      <p className="prompt-kicker">PROMPT {state.questionIndex + 1} OF {state.questions.length}</p>
      <h1 id="current-prompt">{question.prompt}</h1>
      <p className="rarity-hint">▼ rarer answers sink deeper ▼</p>
      {preview ? (
        <p className="preview-countdown" aria-live="polite">
          DESCENT BEGINS IN <strong>{state.previewSeconds}</strong>
        </p>
      ) : (
        <p className="prompt-category">{question.category.toUpperCase()} / {question.difficulty.toUpperCase()}</p>
      )}
    </section>
  );
}
