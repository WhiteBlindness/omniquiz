import type { GameMode, GameState } from "./gameReducer";

type GameHudProps = Readonly<{
  state: GameState;
  mode: GameMode;
}>;

export function GameHud({ state, mode }: GameHudProps) {
  const roundCount = state.questions.length || 7;
  const label = mode === "unlimited" ? "THE ENDLESS DIVE" : "THE DAILY DIVE";
  const currentQuestion = state.questions[state.questionIndex] ?? null;
  const completedRounds = Math.min(
    state.questionIndex + (state.phase === "feedback" || state.phase === "summary" ? 1 : 0),
    roundCount,
  );
  const progressText = `${completedRounds} of ${roundCount} prompts logged`;
  const remainingTime = String(state.remainingSeconds).padStart(2, "0");
  const isUrgent = state.phase === "answering" && state.remainingSeconds <= 5;

  return (
    <header className="game-hud" aria-label="Dive telemetry">
      <div className="hud-brand" aria-label="OMNIQUIZ">OMNIQUIZ</div>
      <div className="hud-meter hud-depth" aria-label="Current depth">
        <span>DEPTH</span>
        <strong>{state.depthMetres}m</strong>
      </div>
      <div
        className="hud-timer"
        role="timer"
        aria-live="off"
        aria-label={`${state.remainingSeconds} seconds remaining`}
        data-urgency={isUrgent ? "critical" : "normal"}
      >
        <span>TIMER</span>
        <div className="hud-timer-dial" aria-hidden="true">
          <strong>{remainingTime}</strong>
        </div>
      </div>
      <div className="hud-meter hud-score" aria-label="Current score">
        <span>SCORE</span>
        <strong>{state.score}</strong>
      </div>
      <div
        className="hud-rounds"
        role="progressbar"
        aria-label="Prompt progress"
        aria-valuemin={0}
        aria-valuemax={roundCount}
        aria-valuenow={completedRounds}
        aria-valuetext={progressText}
      >
        <span className="hud-rounds-label">ROUND</span>
        {Array.from({ length: roundCount }, (_, index) => (
          <span
            className={`hud-round-step ${index < completedRounds ? "is-complete" : ""} ${index === state.questionIndex ? "is-current" : ""}`}
            aria-hidden="true"
            key={index}
          >
            <b>{index + 1}</b><i />
          </span>
        ))}
      </div>
      <span className="hud-title">{label}</span>
      {currentQuestion ? (
        <span className="hud-question-meta">
          {currentQuestion.category.toUpperCase()} / {currentQuestion.difficulty.toUpperCase()}
        </span>
      ) : null}
      <div className="hud-legend" role="group" aria-label="Rarity legend">
        <span><i className="hud-legend-swatch hud-legend-common" aria-hidden="true" />PLANKTON 10</span>
        <span><i className="hud-legend-swatch hud-legend-rare" aria-hidden="true" />RARE 60</span>
        <span><i className="hud-legend-swatch hud-legend-krillion" aria-hidden="true" />KRILLION 100</span>
        <span className="sr-only">points; every point descends 10 metres</span>
      </div>
    </header>
  );
}
