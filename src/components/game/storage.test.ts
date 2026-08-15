// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import type { SubmissionResult } from "../../lib/game/scoring";
import { getUtcDateKey } from "../../lib/questions/date";
import {
  PROGRESS_STORAGE_KEY,
  readProgress,
  readThemePreference,
  recoverPersistedProgress,
  writeThemePreference,
  type PersistedProgress,
} from "./storage";
import { createInitialGameState, gameReducer } from "./gameReducer";

const lastResult: SubmissionResult = Object.freeze({
  recognized: true,
  normalizedAnswer: "gulfstream",
  answerLabel: "Gulf Stream",
  crowdShare: 7.5,
  tier: "rare",
  score: 60,
  depthMetres: 600,
  quip: "A warm current with a quieter route.",
  commonAnswers: Object.freeze([{ label: "Phone", share: 34 }]),
});

const baseProgress: PersistedProgress = {
  version: 3,
  mode: "daily",
  dailyDate: "2026-08-15",
  phase: "answering",
  questionIndex: 0,
  score: 30,
  depthMetres: 300,
  answer: "",
  remainingSeconds: 4,
  previewSeconds: 0,
  lastResult: null,
  roundLog: [],
  questions: [
    {
      id: "general-001",
      category: "General",
      prompt: "Name a warm current.",
    },
  ],
  savedAt: 1_000,
};

describe("crowd dive persistence", () => {
  it("preserves an expired answer at zero so restoration can time out immediately", () => {
    const recovered = recoverPersistedProgress(baseProgress, 6_500);
    const restored = gameReducer(createInitialGameState("daily"), {
      type: "RESTORE_PROGRESS",
      progress: recovered,
    });
    const timedOut = gameReducer(restored, { type: "TIME_EXPIRED" });

    expect(recovered).toMatchObject({ phase: "answering", remainingSeconds: 0 });
    expect(restored).toMatchObject({ phase: "answering", remainingSeconds: 0 });
    expect(timedOut).toMatchObject({ phase: "feedback", lastOutcome: "timeout", score: 30 });
  });

  it("reconstructs restored answer time from the saved absolute interval", () => {
    const recovered = recoverPersistedProgress(baseProgress, 2_500);

    expect(recovered).toMatchObject({
      phase: "answering",
      remainingSeconds: 3,
      savedAt: 2_500,
    });
  });

  it("keeps restored preview time aligned to elapsed seconds", () => {
    const recovered = recoverPersistedProgress(
      { ...baseProgress, phase: "preview", previewSeconds: 3, savedAt: 1_000 },
      2_500,
    );

    expect(recovered).toMatchObject({ phase: "preview", previewSeconds: 2, savedAt: 2_500 });
  });

  it("preserves a live timer and resets unsafe submitting state", () => {
    const submitting = { ...baseProgress, phase: "submitting" as const };
    expect(recoverPersistedProgress(submitting, 2_000)).toMatchObject({
      phase: "answering",
      remainingSeconds: 4,
    });
  });

  it("retains a valid feedback result and immutable round log", () => {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        ...baseProgress,
        phase: "feedback",
        lastResult,
        roundLog: [{
          questionId: "general-001",
          prompt: "Name a warm current.",
          outcome: "answer",
          submittedAnswer: "Gulf Stream",
          answerLabel: "Gulf Stream",
          crowdShare: 7.5,
          tier: "rare",
          score: 60,
          depthMetres: 600,
          commonAnswers: [{ label: "Phone", share: 34 }],
        }],
      }),
    );

    const progress = readProgress("daily", "2026-08-15");
    expect(progress).toMatchObject({ phase: "feedback", lastResult });
    expect(Object.isFrozen(progress?.roundLog)).toBe(true);
    expect(Object.isFrozen(progress?.roundLog[0])).toBe(true);
  });

  it("rejects malformed feedback instead of restoring a dead-end phase", () => {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        ...baseProgress,
        phase: "feedback",
        lastResult: { ...lastResult, tier: "not-a-tier" },
      }),
    );
    expect(readProgress("daily", "2026-08-15")).toBeNull();
  });

  it("restores a finished summary with its scored progress and log", () => {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        ...baseProgress,
        phase: "summary",
        score: 145,
        depthMetres: 1_450,
        lastResult: null,
      }),
    );
    expect(readProgress("daily", "2026-08-15")).toMatchObject({ phase: "summary", score: 145, depthMetres: 1_450 });
  });

  it("restores a same-day daily run but rejects a progress record from the next UTC day", () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(baseProgress));

    expect(readProgress("daily", "2026-08-15")).toMatchObject({ dailyDate: "2026-08-15" });
    expect(readProgress("daily", "2026-08-16")).toBeNull();
  });

  it("rejects the old v2 schema instead of restoring date-blind daily state", () => {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ ...baseProgress, version: 2 }),
    );

    expect(readProgress("daily", "2026-08-15")).toBeNull();
  });

  it("keeps unlimited progress restorable without a daily date", () => {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ ...baseProgress, mode: "unlimited", dailyDate: null }),
    );

    expect(readProgress("unlimited", getUtcDateKey(Date.UTC(2040, 0, 1)))).toMatchObject({
      mode: "unlimited",
      dailyDate: null,
    });
  });

  it("reads and writes a valid theme preference", () => {
    writeThemePreference("light");
    expect(readThemePreference()).toBe("light");
  });

  it("falls back to dark when the theme preference is malformed", () => {
    localStorage.setItem("omniquiz-theme-v1", JSON.stringify("solarized"));
    expect(readThemePreference()).toBe("dark");
  });
});
