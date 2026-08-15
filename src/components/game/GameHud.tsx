import type { CSSProperties } from "react";

import { ANSWER_SECONDS, type GameMode, type GamePhase, type GameState } from "./gameReducer";

type GameHudProps = Readonly<{
  state: GameState;
  mode: GameMode;
  remainingMilliseconds: number;
}>;

const TIMER_DURATION_MS = ANSWER_SECONDS * 1_000;

type TimerWindowState = "armed" | "open" | "closed";

const getTimerWindowState = (
  phase: GamePhase,
  remainingMilliseconds: number,
): TimerWindowState => {
  if (phase === "preview") return "armed";
  if (
    (phase === "answering" || phase === "submitting") &&
    remainingMilliseconds > 0
  ) {
    return "open";
  }
  return "closed";
};

const getRemainingSeconds = (remainingMilliseconds: number): number =>
  Math.max(0, Math.ceil(Math.max(0, remainingMilliseconds) / 1_000));

const getTimerProgress = (
  timerState: TimerWindowState,
  remainingMilliseconds: number,
): number => {
  if (timerState === "armed") return 1;
  if (timerState === "closed") return 0;
  return Math.min(1, Math.max(0, remainingMilliseconds / TIMER_DURATION_MS));
};

const formatWindowTime = (remainingMilliseconds: number): string => {
  const tenths = Math.max(0, Math.ceil(remainingMilliseconds / 100));
  const seconds = Math.floor(tenths / 10);
  return `WINDOW T-00:${String(seconds).padStart(2, "0")}.${tenths % 10}`;
};

export const getWindowLabel = (
  phase: GamePhase,
  remainingMilliseconds: number,
): string => {
  const timerState = getTimerWindowState(phase, remainingMilliseconds);
  return timerState === "armed"
    ? "WINDOW ARMED"
    : timerState === "closed"
      ? "WINDOW CLOSED"
      : formatWindowTime(remainingMilliseconds);
};

export function GameHud({ state, mode, remainingMilliseconds }: GameHudProps) {
  const roundCount = state.questions.length || 7;
  const label = mode === "unlimited" ? "THE ARCADE DIVE" : "THE DAILY DIVE";
  const currentQuestion = state.questions[state.questionIndex] ?? null;
  const completedRounds = Math.min(
    state.questionIndex + (
      state.phase === "feedback" ||
      state.phase === "summary"
        ? 1
        : 0
    ),
    roundCount,
  );
  const visibleRoundCount = Math.min(7, roundCount);
  const firstVisibleRound = Math.min(
    Math.max(0, state.questionIndex - 3),
    Math.max(0, roundCount - visibleRoundCount),
  );
  const visibleRounds = Array.from(
    { length: visibleRoundCount },
    (_, index) => firstVisibleRound + index,
  );
  const progressText = `${completedRounds} of ${roundCount} prompts logged`;
  const timerState = getTimerWindowState(state.phase, remainingMilliseconds);
  const remainingSeconds = getRemainingSeconds(remainingMilliseconds);
  const remainingTime = String(remainingSeconds).padStart(2, "0");
  const timerProgress = getTimerProgress(timerState, remainingMilliseconds);
  const timerLabel = timerState === "open"
    ? `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"} remaining`
    : timerState === "armed"
      ? "Answer window armed"
      : "Answer window closed";
  const isUrgent = timerState === "open" && remainingSeconds <= 5;

  return (
    <header className="game-hud" aria-label="Dive telemetry">
      <div className="hud-brand" aria-label="OMNIQUIZ">OMNIQUIZ</div>
      <div className="hud-meter hud-depth" aria-label="Current depth">
        <span>DEPTH</span>
        <strong className="telemetry-data">{state.depthMetres}m</strong>
      </div>
      <div
        className="hud-timer"
        role="timer"
        aria-live="off"
        aria-label={timerLabel}
        data-urgency={isUrgent ? "critical" : "normal"}
        data-window-state={timerState}
      >
        <span>TIMER</span>
        <div
          className="hud-timer-dial"
          aria-hidden="true"
          style={{ "--timer-progress": timerProgress } as CSSProperties}
        >
          <span className="hud-timer-dial-core" />
          <strong className="telemetry-data">
            {timerState === "open" ? remainingTime : timerState.toUpperCase()}
          </strong>
        </div>
      </div>
      <div className="hud-meter hud-score" aria-label="Current score">
        <span>SCORE</span>
        <strong className="telemetry-data">{state.score}</strong>
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
        <span className="hud-rounds-label telemetry-data">ROUND {state.questionIndex + 1} / {roundCount}</span>
        {visibleRounds.map((index) => (
          <span
            className={`hud-round-step ${index < completedRounds ? "is-complete" : ""} ${index === state.questionIndex ? "is-current" : ""}`}
            aria-hidden="true"
            key={index}
          >
            <b className="telemetry-data">{index + 1}</b><i />
          </span>
        ))}
      </div>
      <span className="hud-title">{label}</span>
      {currentQuestion ? (
        <span className="hud-question-meta">
          {currentQuestion.category.toUpperCase()} / CROWD ATLAS
        </span>
      ) : null}
      <div className="hud-legend" role="group" aria-label="Rarity legend">
        <span><i className="hud-legend-swatch hud-legend-common" aria-hidden="true" />PLANKTON 10</span>
        <span><i className="hud-legend-swatch hud-legend-rare" aria-hidden="true" />RARE CATCH 60</span>
        <span><i className="hud-legend-swatch hud-legend-krillion" aria-hidden="true" />KRILLION 100</span>
        <span className="sr-only">points; every point descends 10 metres</span>
      </div>
    </header>
  );
}
