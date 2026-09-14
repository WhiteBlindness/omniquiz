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

  return (
    <div className="last-run-badge" aria-label="Your stats">
      <span className="last-run-stat">
        <b className="telemetry-data">{stats.bestScore}</b> BEST
      </span>
      <span className="last-run-divider" aria-hidden="true" />
      <span className="last-run-stat">
        <b className="telemetry-data">{stats.runs}</b> {runLabel}
      </span>
      <span className="last-run-divider" aria-hidden="true" />
      <span className="last-run-stat">
        <b className="telemetry-data">{stats.recognized}</b> RECOGNIZED
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
  );
}
