"use client";

import { useEffect, useState } from "react";

import type { GameMode } from "./gameReducer";
import { readStats, type DiveStats, DEFAULT_STATS } from "./storage";

type LastRunBadgeProps = Readonly<{
  mode: GameMode;
}>;

export function LastRunBadge({ mode }: LastRunBadgeProps) {
  const [stats, setStats] = useState<DiveStats>(DEFAULT_STATS);

  useEffect(() => {
    setStats(readStats());
  }, []);

  if (stats.runs === 0) return null;

  const runLabel = mode === "speed" ? "RUNS" : mode === "survival" ? "ATTEMPTS" : "DIVES";
  const recognitionPct = stats.rounds > 0 ? Math.round((stats.recognized / stats.rounds) * 100) : 0;

  return (
    <div className="last-run-badge" aria-label="Your stats">
      <div className="last-run-hero">
        <span className="last-run-hero-value telemetry-data">{stats.bestScore}</span>
        <span className="last-run-hero-label">BEST SCORE</span>
      </div>
      <div className="last-run-stats">
        <span className="last-run-stat">
          <b className="telemetry-data">{stats.runs}</b> {runLabel}
        </span>
        <span className="last-run-divider" aria-hidden="true" />
        <span className="last-run-stat">
          <b className="telemetry-data">{recognitionPct}%</b> RECOGNITION
        </span>
        {mode === "daily" && stats.dailyStreak > 1 ? (
          <>
            <span className="last-run-divider" aria-hidden="true" />
            <span className="last-run-stat last-run-streak">
              <b className="telemetry-data">{stats.dailyStreak}</b> DAY STREAK
            </span>
          </>
        ) : null}
      </div>
      {stats.lastScore > 0 ? (
        <span className="last-run-last">LAST: {stats.lastScore} PTS</span>
      ) : null}
    </div>
  );
}
