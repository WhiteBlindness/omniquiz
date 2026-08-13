// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import type { SubmissionResult } from "../../lib/game/scoring";
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
  version: 2,
  mode: "daily",
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
  it("keeps an expired answer actionable until timeout feedback is created", () => {
    const recovered = recoverPersistedProgress(baseProgress, 6_500);
    const restored = gameReducer(createInitialGameState("daily"), {
      type: "RESTORE_PROGRESS",
      progress: recovered,
    });
    const timedOut = gameReducer(restored, { type: "ANSWER_TICK" });

    expect(recovered).toMatchObject({ phase: "answering", remainingSeconds: 1 });
    expect(timedOut).toMatchObject({ phase: "feedback", lastOutcome: "timeout", score: 30 });
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

    const progress = readProgress("daily");
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
    expect(readProgress("daily")).toBeNull();
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
    expect(readProgress("daily")).toMatchObject({ phase: "summary", score: 145, depthMetres: 1_450 });
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
