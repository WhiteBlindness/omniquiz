import { describe, expect, it } from "vitest";

import type { SubmissionResult } from "../../lib/game/scoring";
import type { PublicQuestion } from "../../lib/questions/types";
import { createInitialGameState, gameReducer } from "./gameReducer";

const questions: readonly PublicQuestion[] = Object.freeze([
  Object.freeze({ id: "general-001", category: "General", prompt: "Name a night habit." }),
  Object.freeze({ id: "general-002", category: "General", prompt: "Name a travel dream." }),
]);

const uncharted: SubmissionResult = Object.freeze({
  recognized: false,
  normalizedAnswer: "purplequantumwalrus",
  answerLabel: "purple quantum walrus",
  crowdShare: null,
  tier: "uncharted",
  score: 0,
  depthMetres: 0,
  quip: "That answer is outside this expedition's atlas.",
  commonAnswers: Object.freeze([{ label: "Check their phone", share: 34 }]),
});

const toSubmitting = (mode: "daily" | "unlimited") => {
  let state = gameReducer(createInitialGameState(mode), {
    type: "LOAD_QUESTIONS",
    questions,
  });
  while (state.phase === "preview") state = gameReducer(state, { type: "PREVIEW_TICK" });
  state = gameReducer(state, { type: "SET_ANSWER", answer: "purple quantum walrus" });
  return gameReducer(state, { type: "SUBMIT_START" });
};

describe("crowd gameplay reducer contract", () => {
  it("continues unlimited mode after an uncharted answer with no penalty", () => {
    const feedback = gameReducer(toSubmitting("unlimited"), {
      type: "SUBMIT_RESOLVED",
      result: uncharted,
    });
    expect(feedback).toMatchObject({ phase: "feedback", score: 0, depthMetres: 0 });
    expect(gameReducer(feedback, { type: "NEXT_ROUND" })).toMatchObject({
      phase: "preview",
      questionIndex: 1,
    });
  });

  it("stores an immutable per-round log that explains the final score", () => {
    const feedback = gameReducer(toSubmitting("daily"), {
      type: "SUBMIT_RESOLVED",
      result: uncharted,
    });
    expect(feedback.roundLog).toEqual([
      expect.objectContaining({
        questionId: "general-001",
        prompt: "Name a night habit.",
        outcome: "answer",
        answerLabel: "purple quantum walrus",
        score: 0,
      }),
    ]);
    expect(Object.isFrozen(feedback.roundLog)).toBe(true);
    expect(Object.isFrozen(feedback.roundLog[0])).toBe(true);
  });
});
