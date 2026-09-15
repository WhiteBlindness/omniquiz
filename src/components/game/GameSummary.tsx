import Link from "next/link";
import type { CSSProperties } from "react";
import { useState } from "react";

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
  const recognized = roundLog.filter((r) => r.tier !== "uncharted" && r.crowdShare !== null).length;

  const tierBuckets = roundLog.reduce<Record<string, number>>((acc, r) => {
    acc[r.tier] = (acc[r.tier] ?? 0) + r.score;
    return acc;
  }, {});
  const tierSegments = [
    { tier: "krillion", label: "KRILLION", score: tierBuckets.krillion ?? 0 },
    { tier: "deepcut", label: "DEEP CUT", score: tierBuckets.deepcut ?? 0 },
    { tier: "rare", label: "RARE", score: tierBuckets.rare ?? 0 },
    { tier: "schooler", label: "SCHOOLER", score: tierBuckets.schooler ?? 0 },
    { tier: "plankton", label: "PLANKTON", score: tierBuckets.plankton ?? 0 },
    { tier: "tooclever", label: "TOO CLEVER", score: tierBuckets.tooclever ?? 0 },
  ].filter((s) => s.score > 0);

  return (
    <section className="summary-panel" aria-labelledby="summary-title">
      <p className="sr-only">
        {mode === "speed" ? "Race complete" : mode === "survival" ? "Run ended" : "Dive logged after the final prompt"}
      </p>
      <h1 id="summary-title">
        {mode === "speed" ? "SPEED RUN COMPLETE"
          : mode === "survival" ? (lives === 0 ? "SIGNAL LOST" : "SURVIVAL COMPLETE")
          : mode === "unlimited" ? "ARCADE RUN COMPLETE"
          : "DIVE COMPLETE"}
      </h1>
      <div className="summary-score">
        <span>FINAL SCORE</span>
        <strong className="telemetry-data" aria-label={`${score} points`}>{animatedScore}</strong>
        {score > 0 && score >= stats.bestScore && stats.runs > 1 ? (
          <small className="personal-best">NEW PERSONAL BEST</small>
        ) : (
          <small>points earned from recognizable rarity</small>
        )}
      </div>
      <div className="summary-depth">
        <span>YOU REACHED</span>
        <b className="telemetry-data" aria-label={`${depthMetres} metres`}>{animatedDepth}m</b>
      </div>
      {mode === "daily" ? (
        <>
          <div className="summary-percentile">
            <span>EST. SCORE PERCENTILE</span>
            <b className="telemetry-data">P{String(estimatedPercentile).padStart(2, "0")}</b>
            <small>against the 700-point daily ceiling</small>
          </div>
          {stats.dailyStreak > 1 ? (
            <div className="summary-streak">
              <span>DAILY STREAK</span>
              <b className="telemetry-data">{stats.dailyStreak} DAYS</b>
            </div>
          ) : null}
        </>
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
        {recognized}/{roundLog.length} RECOGNIZED · BEST LOG {stats.bestScore} · RUNS {stats.runs}
      </p>
      {score > 0 && tierSegments.length > 0 ? (
        <div className="score-composition" aria-label="Score breakdown by rarity tier">
          <span className="score-composition-label">SCORE COMPOSITION</span>
          <div className="score-composition-bar" aria-hidden="true">
            {tierSegments.map((s) => (
              <span
                key={s.tier}
                className={`score-segment tier-${s.tier}`}
                style={{ "--segment-share": s.score / score } as CSSProperties}
                title={`${s.label}: ${s.score} pts`}
              />
            ))}
          </div>
          <div className="score-composition-legend">
            {tierSegments.map((s) => (
              <span key={s.tier} className={`score-legend-item tier-${s.tier}`}>
                <i aria-hidden="true" />
                <small className="telemetry-data">{s.label} {s.score}</small>
              </span>
            ))}
          </div>
        </div>
      ) : null}
      <SummaryLog roundLog={roundLog} mode={mode} />
      <div className="summary-actions">
        <button className="continue-button" type="button" onClick={onReplay}>
          {mode === "speed" ? "RACE AGAIN" : mode === "survival" ? "ENTER AGAIN" : "DIVE AGAIN"}
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

function SummaryLog({ roundLog, mode }: { roundLog: readonly RoundLog[]; mode: string }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="summary-log" aria-label={mode === "speed" ? "Race log" : mode === "survival" ? "Threat log" : "Dive log"}>
      <div className="summary-log-heading">
        <span>{mode === "speed" ? "RACE LOG" : mode === "survival" ? "THREAT LOG" : "DIVE LOG"}</span>
        <small>{roundLog.length} ROUNDS</small>
      </div>
      {roundLog.map((entry, index) => {
        const hasCommon = entry.commonAnswers.length > 0;
        const isExpanded = expandedIndex === index;
        return (
          <div
            className={`summary-log-entry ${isExpanded ? "is-expanded" : ""}`}
            data-tier={entry.tier}
            key={`${entry.questionId}-${index}`}
          >
            <span className="summary-log-round telemetry-data">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <button
                className="summary-log-toggle"
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                disabled={!hasCommon}
              >
                <strong>{entry.answerLabel}</strong>
                {hasCommon ? <span className="summary-log-chevron" aria-hidden="true" /> : null}
              </button>
              <small className="telemetry-data">
                {entry.crowdShare === null ? "UNCHARTED" : `${entry.crowdShare}% CROWD`} · +{entry.score} PTS · {entry.depthMetres}m
              </small>
              <small className="summary-log-prompt">{entry.prompt}</small>
              {isExpanded ? (
                <ul className="summary-log-common" aria-label="Common answers for this round">
                  {entry.commonAnswers.map((a) => (
                    <li key={a.label}>
                      <b>{a.label}</b>
                      <small className="telemetry-data">{a.share}%</small>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
