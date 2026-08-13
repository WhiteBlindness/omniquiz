import type { DiveStats } from "./storage";
import { getEstimatedDailyPercentile } from "../../lib/game/percentile";

type GameSummaryProps = Readonly<{
  score: number;
  depthMetres: number;
  mode: "daily" | "unlimited";
  stats: DiveStats;
  gameOver: boolean;
  onReplay: () => void;
}>;

export function GameSummary({ score, depthMetres, mode, stats, gameOver, onReplay }: GameSummaryProps) {
  const estimatedPercentile = getEstimatedDailyPercentile(score);

  return (
    <section
      className={`summary-panel ${gameOver ? "game-over-panel" : ""}`}
      aria-labelledby="summary-title"
    >
      <p className="sr-only">
        {gameOver ? "Game over after a missed prompt." : "Dive logged after the final prompt"}
      </p>
      <h1 id="summary-title">
        {gameOver ? "GAME OVER" : mode === "unlimited" ? "ARCADE RUN COMPLETE" : "DIVE COMPLETE"}
      </h1>
      <div className="summary-score">
        <span>FINAL SCORE</span>
        <strong>{score}</strong>
        <small>points below the surface</small>
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
      <p className="summary-stats">BEST LOG {stats.bestScore} · RUNS {stats.runs}</p>
      <div className="summary-actions">
        <button className="continue-button" type="button" onClick={onReplay}>
          {gameOver ? "PLAY AGAIN" : "DIVE AGAIN"}
        </button>
        <a className="secondary-link" href={mode === "unlimited" ? "/" : "/unlimited/classic"}>
          {mode === "unlimited" ? "TODAY'S DIVE" : "TRY ARCADE MODE"}
        </a>
      </div>
    </section>
  );
}
