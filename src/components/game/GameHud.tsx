import type { GameMode, GameState } from "./gameReducer";

type GameHudProps = Readonly<{
  state: GameState;
  mode: GameMode;
}>;

export function GameHud({ state, mode }: GameHudProps) {
  const roundCount = state.questions.length || 7;
  const label = mode === "unlimited" ? "THE ENDLESS DIVE" : "THE DAILY DIVE";

  return (
    <header className="game-hud" aria-label="Dive status">
      <div className="hud-meter hud-depth">
        <span>DEPTH</span>
        <strong>{state.depthMetres}m</strong>
      </div>
      <div className="hud-center">
        <span className="hud-title">{label}</span>
        <div className="round-lamps" aria-hidden="true">
          {Array.from({ length: roundCount }, (_, index) => (
            <i className={index < state.questionIndex ? "is-lit" : ""} key={index} />
          ))}
        </div>
        <span className="hud-round">PROMPT {Math.min(state.questionIndex + 1, roundCount)} OF {roundCount}</span>
      </div>
      <div className="hud-meter hud-score">
        <span>SCORE</span>
        <strong>{state.score}</strong>
      </div>
    </header>
  );
}
