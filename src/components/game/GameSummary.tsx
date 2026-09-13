import Link from "next/link";

import { useCountUp } from "../../hooks/useCountUp";
import { getEstimatedDailyPercentile } from "../../lib/game/percentile";
import type { RoundLog } from "./gameReducer";
import type { DiveStats } from "./storage";

type GameSummaryProps = Readonly<{
  score: number;
  depthMetres: number;
  mode: "daily" | "unlimited" | "speed" | "survival";
  stats: DiveStats;
  roundLog: readonly RoundLog[];
  shareLabel: string;
  onReplay: () => void;
  onShare: () => void;
  lives?: number;
  bestStreak?: number;
}>;

export function GameSummary({
  score,
  depthMetres,
  mode,
  stats,
  roundLog,
  shareLabel,
  onReplay,
  onShare,
  lives,
  bestStreak,
}: GameSummaryProps) {
  const estimatedPercentile = getEstimatedDailyPercentile(score);
  const animatedScore = useCountUp(score);
  const animatedDepth = useCountUp(depthMetres);

  return (
    <section className="summary-panel" aria-labelledby="summary-title">
      <p className="sr-only">Dive logged after the final prompt</p>
      <h1 id="summary-title">
        {mode === "speed" ? "SPEED RUN COMPLETE"
          : mode === "survival" ? (lives === 0 ? "SIGNAL LOST" : "SURVIVAL COMPLETE")
          : mode === "unlimited" ? "ARCADE RUN COMPLETE"
          : "DIVE COMPLETE"}
      </h1>
      <div className="summary-score">
        <span>FINAL SCORE</span>
        <strong className="telemetry-data" aria-label={`${score} points`}>{animatedScore}</strong>
        <small>points earned from recognizable rarity</small>
      </div>
      <div className="summary-depth">
        <span>YOU REACHED</span>
        <b className="telemetry-data" aria-label={`${depthMetres} metres`}>{animatedDepth}m</b>
      </div>
      {mode === "daily" ? (
        <div className="summary-percentile">
          <span>EST. SCORE PERCENTILE</span>
          <b className="telemetry-data">P{String(estimatedPercentile).padStart(2, "0")}</b>
          <small>against the 700-point daily ceiling</small>
        </div>
      ) : null}
      {mode === "speed" && bestStreak !== undefined ? (
        <div className="summary-streak">
          <span>BEST STREAK</span>
          <b className="telemetry-data">{bestStreak}×</b>
        </div>
      ) : null}
      {mode === "survival" ? (
        <div className="summary-lives">
          <span>{lives === 0 ? "ALL LIVES LOST" : `${lives} ${lives === 1 ? "LIFE" : "LIVES"} REMAINING`}</span>
          <b className="telemetry-data">{roundLog.length} ROUNDS SURVIVED</b>
        </div>
      ) : null}
      <p className="summary-stats telemetry-data">
        BEST LOG {stats.bestScore} · RUNS {stats.runs} · RECOGNIZED {stats.recognized}
      </p>
      <div className="summary-log" aria-label="Dive log">
        <div className="summary-log-heading"><span>DIVE LOG</span><small>{roundLog.length} ROUNDS</small></div>
        {roundLog.map((entry, index) => (
          <div className="summary-log-entry" data-tier={entry.tier} key={`${entry.questionId}-${index}`}>
            <span className="summary-log-round telemetry-data">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{entry.answerLabel}</strong>
              <small className="telemetry-data">
                {entry.crowdShare === null ? "UNCHARTED" : `${entry.crowdShare}% CROWD`} · +{entry.score} PTS · {entry.depthMetres}m
              </small>
            </div>
          </div>
        ))}
      </div>
      <div className="summary-actions">
        <button className="continue-button" type="button" onClick={onReplay}>
          DIVE AGAIN
        </button>
        <button className="share-button pixel-control" type="button" onClick={onShare}>
          {shareLabel}
        </button>
        <Link className="secondary-link" href={mode === "daily" ? "/unlimited/classic" : "/"}>
          {mode === "daily" ? "TRY UNLIMITED MODE" : "TODAY'S DIVE"}
        </Link>
      </div>
    </section>
  );
}
