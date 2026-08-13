import { describe, expect, it } from "vitest";

import type { SubmissionResult } from "../../lib/game/scoring";
import type { PublicQuestion } from "../../lib/questions/types";
import {
  ANSWER_SECONDS,
  PREVIEW_SECONDS,
  createInitialGameState,
  gameReducer,
} from "./gameReducer";

const question: PublicQuestion = Object.freeze({
  id: "general-001",
  category: "General",
  prompt: "Name a warm current.",
});

const secondQuestion: PublicQuestion = Object.freeze({
  id: "general-002",
  category: "General",
  prompt: "Name a night habit.",
});

const recognized: SubmissionResult = Object.freeze({
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

const uncharted: SubmissionResult = Object.freeze({
  recognized: false,
  normalizedAnswer: "purplequantumwalrus",
  answerLabel: "purple quantum walrus",
  crowdShare: null,
  tier: "uncharted",
  score: 0,
  depthMetres: 0,
  quip: "That answer is outside this expedition's atlas.",
  commonAnswers: Object.freeze([{ label: "Phone", share: 34 }]),
});

const toAnswering = (mode: "daily" | "unlimited", questions = [question]) => {
  const loaded = gameReducer(createInitialGameState(mode), {
    type: "LOAD_QUESTIONS",
    questions,
  });
  return gameReducer(
    gameReducer(
      gameReducer(loaded, { type: "PREVIEW_TICK" }),
      { type: "PREVIEW_TICK" },
    ),
    { type: "PREVIEW_TICK" },
  );
};

describe("gameReducer", () => {
  it("starts in a quiet intro state with an empty immutable dive log", () => {
    const state = createInitialGameState("daily");
    expect(state).toMatchObject({ phase: "intro", score: 0, depthMetres: 0, roundLog: [] });
    expect(Object.isFrozen(state.roundLog)).toBe(true);
  });

  it("moves into a three-second preview and then the answer window", () => {
    const loaded = gameReducer(createInitialGameState("daily"), {
      type: "LOAD_QUESTIONS",
      questions: [question],
    });
    expect(loaded).toMatchObject({ phase: "preview", previewSeconds: PREVIEW_SECONDS, remainingSeconds: ANSWER_SECONDS });
    const answering = gameReducer(
      gameReducer(
        gameReducer(loaded, { type: "PREVIEW_TICK" }),
        { type: "PREVIEW_TICK" },
      ),
      { type: "PREVIEW_TICK" },
    );
    expect(answering.phase).toBe("answering");
  });

  it("adds only positive score/depth and freezes an explainable round log", () => {
    const answering = toAnswering("daily");
    const withAnswer = gameReducer(answering, { type: "SET_ANSWER", answer: "Gulf Stream" });
    const feedback = gameReducer(
      gameReducer(withAnswer, { type: "SUBMIT_START" }),
      { type: "SUBMIT_RESOLVED", result: recognized },
    );

    expect(feedback).toMatchObject({ phase: "feedback", score: 60, depthMetres: 600 });
    expect(feedback.roundLog).toEqual([
      expect.objectContaining({
        questionId: "general-001",
        prompt: "Name a warm current.",
        outcome: "answer",
        submittedAnswer: "Gulf Stream",
        answerLabel: "Gulf Stream",
        crowdShare: 7.5,
        score: 60,
      }),
    ]);
    expect(Object.isFrozen(feedback.roundLog)).toBe(true);
    expect(Object.isFrozen(feedback.roundLog[0])).toBe(true);
  });

  it("continues unlimited mode after uncharted, pass, and timeout outcomes", () => {
    const answering = toAnswering("unlimited", [question, secondQuestion]);
    const unchartedFeedback = gameReducer(
      gameReducer(
        gameReducer(answering, { type: "SET_ANSWER", answer: "purple quantum walrus" }),
        { type: "SUBMIT_START" },
      ),
      { type: "SUBMIT_RESOLVED", result: uncharted },
    );

    expect(unchartedFeedback).toMatchObject({ phase: "feedback", score: 0, depthMetres: 0 });
    expect(gameReducer(unchartedFeedback, { type: "NEXT_ROUND" })).toMatchObject({
      phase: "preview",
      questionIndex: 1,
    });

    const passed = gameReducer(toAnswering("unlimited"), { type: "PASS_QUESTION" });
    expect(passed).toMatchObject({ phase: "feedback", score: 0, depthMetres: 0, lastOutcome: "pass" });
    const timedOut = gameReducer(toAnswering("unlimited"), { type: "TIME_EXPIRED" });
    expect(timedOut).toMatchObject({ phase: "feedback", score: 0, depthMetres: 0, lastOutcome: "timeout" });
  });

  it("finishes only after the final feedback, never through a miss branch", () => {
    const first = gameReducer(createInitialGameState("daily"), {
      type: "LOAD_QUESTIONS",
      questions: [question, secondQuestion],
    });
    const firstFeedback = gameReducer(first, { type: "TIME_EXPIRED" });
    const secondPreview = gameReducer(firstFeedback, { type: "NEXT_ROUND" });
    const secondFeedback = gameReducer(secondPreview, { type: "TIME_EXPIRED" });
    const summary = gameReducer(secondFeedback, { type: "NEXT_ROUND" });

    expect(summary.phase).toBe("summary");
    expect(summary.roundLog).toHaveLength(2);
    expect(summary.roundLog.every((entry) => entry.score === 0)).toBe(true);
  });
});
