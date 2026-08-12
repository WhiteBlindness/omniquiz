// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import type { SubmissionResult } from "../../lib/game/scoring";
import {
  PROGRESS_STORAGE_KEY,
  readProgress,
  recoverPersistedProgress,
  type PersistedProgress,
} from "./storage";
import { createInitialGameState, gameReducer } from "./gameReducer";

const lastResult: SubmissionResult = Object.freeze({
  accepted: true,
  normalizedAnswer: "gulf stream",
  tier: "rare",
  score: 60,
  depth: 0.6,
  quip: "A sharp bit of recall.",
});

const baseProgress: PersistedProgress = {
  version: 1,
  mode: "daily",
  phase: "answering",
  questionIndex: 0,
  score: 30,
  depthMetres: 300,
  answer: "",
  remainingSeconds: 4,
  previewSeconds: 0,
  lastResult: null,
  questions: [
    {
      id: "general-001",
      category: "General",
      prompt: "Name a warm current.",
      difficulty: "easy",
      rarity: { tier: "rare", score: 60, depth: 0.6 },
    },
  ],
  savedAt: 1_000,
};

describe("recoverPersistedProgress", () => {
  it("keeps an expired answer actionable until the reducer creates timeout feedback", () => {
    const recovered = recoverPersistedProgress(baseProgress, 6_500);
    const restored = gameReducer(createInitialGameState("daily"), {
      type: "RESTORE_PROGRESS",
      progress: recovered,
    });
    const timedOut = gameReducer(restored, { type: "ANSWER_TICK" });

    expect(recovered).toMatchObject({
      phase: "answering",
      remainingSeconds: 1,
    });
    expect(timedOut).toMatchObject({
      phase: "feedback",
      lastResult: expect.objectContaining({ accepted: false, score: 0 }),
    });
  });

  it("preserves a live timer and resets unsafe submitting state", () => {
    const submitting = { ...baseProgress, phase: "submitting" as const };

    expect(recoverPersistedProgress(submitting, 2_000)).toMatchObject({
      phase: "answering",
      remainingSeconds: 4,
    });
  });

  it("retains a valid feedback result at the storage boundary", () => {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ ...baseProgress, phase: "feedback", lastResult }),
    );

    expect(readProgress("daily")).toMatchObject({
      phase: "feedback",
      lastResult,
    });
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

  it("restores a finished summary with its scored progress", () => {
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

    expect(readProgress("daily")).toMatchObject({
      phase: "summary",
      score: 145,
      depthMetres: 1_450,
      lastResult: null,
    });
  });
});
