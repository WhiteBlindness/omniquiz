import type { DiveStats } from "./storage";

type GameSummaryProps = Readonly<{
  score: number;
  depthMetres: number;
  mode: "daily" | "unlimited";
  stats: DiveStats;
  onReplay: () => void;
}>;

export function GameSummary({ score, depthMetres, mode, stats, onReplay }: GameSummaryProps) {
  return (
    <section className="summary-panel" aria-labelledby="summary-title">
      <p className="sr-only">Dive logged after seven prompts</p>
      <h1 id="summary-title">{mode === "unlimited" ? "ENDLESS RUN COMPLETE" : "DIVE COMPLETE"}</h1>
      <div className="summary-score">
        <span>FINAL SCORE</span>
        <strong>{score}</strong>
        <small>points below the surface</small>
      </div>
      <div className="summary-depth">
        <span>YOU REACHED</span>
        <b>{depthMetres}m</b>
      </div>
      <p className="summary-stats">BEST LOG {stats.bestScore} · RUNS {stats.runs}</p>
      <div className="summary-actions">
        <button className="continue-button" type="button" onClick={onReplay}>DIVE AGAIN</button>
        <a className="secondary-link" href={mode === "unlimited" ? "/" : "/unlimited/classic"}>
          {mode === "unlimited" ? "TODAY&apos;S DIVE" : "TRY ENDLESS MODE"}
        </a>
      </div>
    </section>
  );
}
