import Link from "next/link";
import type { CSSProperties } from "react";

import { rarityForCrowdShare } from "../../lib/game/scoring";
import { useLexicon } from "./EnvironmentContext";
import { answerSecondsForMode, type GameMode, type GamePhase, type GameState } from "./gameReducer";

type GameHudProps = Readonly<{
  state: GameState;
  mode: GameMode;
  remainingMilliseconds: number;
  bestScore: number;
  atlasLabel?: string;
  stage?: Readonly<{ label: string; short: string }>;
  onExit?: () => void;
}>;

const LEGEND_SHARE = { plankton: 30, rare: 5, krillion: 1 } as const;

const timerDurationMs = (mode: GameMode): number => answerSecondsForMode(mode) * 1_000;

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
  mode: GameMode,
): number => {
  if (timerState === "armed") return 1;
  if (timerState === "closed") return 0;
  return Math.min(1, Math.max(0, remainingMilliseconds / timerDurationMs(mode)));
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

export function GameHud({
  state,
  mode,
  remainingMilliseconds,
  bestScore,
  atlasLabel = "CROWD ATLAS",
  stage,
  onExit,
}: GameHudProps) {
  const lex = useLexicon();
  const roundCount = state.questions.length || 7;
  const label = lex.modeTitle[mode];
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
  const timerProgress = getTimerProgress(timerState, remainingMilliseconds, mode);
  const timerLabel = timerState === "open"
    ? `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"} remaining`
    : timerState === "armed"
      ? "Answer window armed"
      : "Answer window closed";
  const urgencyLevel =
    timerState !== "open" ? "normal"
    : remainingSeconds <= 5 ? "critical"
    : remainingSeconds <= 8 ? "warning"
    : "normal";

  return (
    <header className="game-hud" aria-label={lex.hudAria[mode]}>
      <div className="hud-brand">
        <Link href="/" className="hud-home" aria-label="OMNIQUIZ home" onClick={(event) => {
          if (!onExit || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
          event.preventDefault();
          onExit();
        }}>OMNIQUIZ</Link>
        {onExit ? (
          <button className="hud-exit" type="button" onClick={onExit} aria-label="Exit to home">
            <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="M4 11.5 12 4l8 7.5M6.5 10v9.5h11V10M10 19.5v-5h4v5" /></svg>
            <span>EXIT</span>
          </button>
        ) : null}
      </div>
      {lex.travel ? (
        <div className="hud-meter hud-depth" aria-label={lex.travel.aria}>
          <span>{lex.travel.label}</span>
          <strong className="telemetry-data hud-value-flash" key={`d-${state.depthMetres}`}>{state.depthMetres}m</strong>
        </div>
      ) : (
        <div className="hud-meter hud-depth hud-stage" aria-label={`${lex.stageLabel}: ${stage?.label ?? ""}`}>
          <span>{lex.stageLabel}</span>
          <strong className="telemetry-data hud-value-flash" key={`st-${stage?.label}`}>
            <span className="stage-long">{stage?.label}</span>
            <span className="stage-short" aria-hidden="true">{stage?.short}</span>
          </strong>
        </div>
      )}
      <div
        className="hud-timer"
        role="timer"
        aria-live="off"
        aria-label={timerLabel}
        data-urgency={urgencyLevel}
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
      <div className={`hud-meter hud-score ${state.score > 0 && state.score >= bestScore && bestScore > 0 ? "hud-score-pb" : ""}`} aria-label="Current score">
        <span>SCORE</span>
        <strong className="telemetry-data hud-value-flash" key={`s-${state.score}`}>{state.score}</strong>
        {state.score > 0 && state.score >= bestScore && bestScore > 0 ? (
          <small className="hud-pb-tag telemetry-data">PB</small>
        ) : null}
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
        {visibleRounds.map((index) => {
          const entry = state.roundLog[index];
          const tierClass = entry ? `step-tier-${entry.tier}` : "";
          const isPass = entry?.outcome === "pass" || entry?.outcome === "timeout";
          return (
            <span
              className={`hud-round-step ${index < completedRounds ? "is-complete" : ""} ${index === state.questionIndex ? "is-current" : ""} ${tierClass}`}
              aria-hidden="true"
              key={index}
            >
              <b className="telemetry-data">{index + 1}</b>
              {entry && !isPass ? <i className="step-pip" /> : <i />}
            </span>
          );
        })}
      </div>
      <span className="hud-title">{label}</span>
      {currentQuestion ? (
        <span className="hud-question-meta">
          {currentQuestion.category.toUpperCase()} / {atlasLabel}
        </span>
      ) : null}
      <div className="hud-legend" role="group" aria-label="Rarity legend">
        {lex.legend.map((entry) => (
          <span key={entry.tier}>
            <i className={`hud-legend-swatch hud-legend-${entry.tier === "plankton" ? "common" : entry.tier}`} aria-hidden="true" />
            {entry.label} {rarityForCrowdShare(LEGEND_SHARE[entry.tier]).score}
          </span>
        ))}
        <span className="sr-only">{lex.travel ? lex.travel.srNote : "points"}</span>
      </div>
    </header>
  );
}
