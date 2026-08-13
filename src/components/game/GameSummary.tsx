import { getEstimatedDailyPercentile } from "../../lib/game/percentile";
import type { RoundLog } from "./gameReducer";
import type { DiveStats } from "./storage";

type GameSummaryProps = Readonly<{
  score: number;
  depthMetres: number;
  mode: "daily" | "unlimited";
  stats: DiveStats;
  roundLog: readonly RoundLog[];
  onReplay: () => void;
}>;

export function GameSummary({
  score,
  depthMetres,
  mode,
  stats,
  roundLog,
  onReplay,
}: GameSummaryProps) {
  const estimatedPercentile = getEstimatedDailyPercentile(score);

  return (
    <section className="summary-panel" aria-labelledby="summary-title">
      <p className="sr-only">Dive logged after the final prompt</p>
      <h1 id="summary-title">{mode === "unlimited" ? "UNLIMITED DIVE COMPLETE" : "DIVE COMPLETE"}</h1>
      <div className="summary-score">
        <span>FINAL SCORE</span>
        <strong>{score}</strong>
        <small>points earned from recognizable rarity</small>
      </div>
      <div className="summary-depth">
        <span>YOU REACHED</span>
        <b>{depthMetres}m</b>
      </div>
      {mode === "daily" ? (
        <div className="summary-percentile">
          <span>EST. SCORE PERCENTILE</span>
          <b>P{String(estimatedPercentile).padStart(2, "0")}</b>
          <small>against the 700-point daily ceiling</small>
        </div>
      ) : null}
      <p className="summary-stats">
        BEST LOG {stats.bestScore} · RUNS {stats.runs} · RECOGNIZED {stats.recognized}
      </p>
      <div className="summary-log" aria-label="Dive log">
        <div className="summary-log-heading"><span>DIVE LOG</span><small>{roundLog.length} ROUNDS</small></div>
        {roundLog.map((entry, index) => (
          <div className="summary-log-entry" key={`${entry.questionId}-${index}`}>
            <span className="summary-log-round">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{entry.answerLabel}</strong>
              <small>
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
        <a className="secondary-link" href={mode === "unlimited" ? "/" : "/unlimited/classic"}>
          {mode === "unlimited" ? "TODAY'S DIVE" : "TRY UNLIMITED MODE"}
        </a>
      </div>
    </section>
  );
}
