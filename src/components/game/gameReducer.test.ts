import { describe, expect, it } from "vitest";

import type { PublicQuestion } from "../../lib/questions/types";
import type { SubmissionResult } from "../../lib/game/scoring";
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
  difficulty: "easy",
  rarity: Object.freeze({ tier: "rare", score: 60, depth: 0.6 }),
});

const success: SubmissionResult = Object.freeze({
  accepted: true,
  normalizedAnswer: "gulf stream",
  tier: "rare",
  score: 60,
  depth: 0.6,
  quip: "A sharp bit of recall.",
});

describe("gameReducer", () => {
  it("starts in a quiet intro state with no question loaded", () => {
    expect(createInitialGameState("daily")).toMatchObject({
      mode: "daily",
      phase: "intro",
      questionIndex: 0,
      score: 0,
      depthMetres: 0,
      questions: [],
    });
  });

  it("moves into a three-second preview when questions arrive", () => {
    const state = createInitialGameState("daily");

    const next = gameReducer(state, { type: "LOAD_QUESTIONS", questions: [question] });

    expect(next).toMatchObject({
      phase: "preview",
      previewSeconds: PREVIEW_SECONDS,
      remainingSeconds: ANSWER_SECONDS,
      questions: [question],
    });
  });

  it("transitions from preview to the answer window without mutating state", () => {
    const state = gameReducer(createInitialGameState("daily"), {
      type: "LOAD_QUESTIONS",
      questions: [question],
    });

    const afterOne = gameReducer(state, { type: "PREVIEW_TICK" });
    const afterTwo = gameReducer(afterOne, { type: "PREVIEW_TICK" });
    const answering = gameReducer(afterTwo, { type: "PREVIEW_TICK" });

    expect(state.phase).toBe("preview");
    expect(answering).toMatchObject({ phase: "answering", previewSeconds: 0 });
    expect(answering.remainingSeconds).toBe(ANSWER_SECONDS);
  });

  it("keeps answer input immutable and records successful feedback as depth", () => {
    const state = gameReducer(createInitialGameState("daily"), {
      type: "LOAD_QUESTIONS",
      questions: [question],
    });
    const afterOne = gameReducer(state, { type: "PREVIEW_TICK" });
    const afterTwo = gameReducer(afterOne, { type: "PREVIEW_TICK" });
    const answering = gameReducer(afterTwo, { type: "PREVIEW_TICK" });
    const withAnswer = gameReducer(answering, {
      type: "SET_ANSWER",
      answer: "  Gulf Stream  ",
    });
    const submitting = gameReducer(withAnswer, { type: "SUBMIT_START" });
    const feedback = gameReducer(submitting, {
      type: "SUBMIT_RESOLVED",
      result: success,
    });

    expect(answering.answer).toBe("");
    expect(withAnswer.answer).toBe("  Gulf Stream  ");
    expect(feedback).toMatchObject({
      phase: "feedback",
      answer: "  Gulf Stream  ",
      lastResult: success,
      score: 60,
      depthMetres: 600,
    });
  });

  it("turns an expired answer window into local miss feedback", () => {
    const loaded = gameReducer(createInitialGameState("daily"), {
      type: "LOAD_QUESTIONS",
      questions: [question],
    });
    const afterOne = gameReducer(loaded, { type: "PREVIEW_TICK" });
    const afterTwo = gameReducer(afterOne, { type: "PREVIEW_TICK" });
    const answering = gameReducer(afterTwo, { type: "PREVIEW_TICK" });

    const expired = gameReducer(answering, { type: "TIME_EXPIRED" });

    expect(expired.phase).toBe("feedback");
    expect(expired.lastResult?.accepted).toBe(false);
    expect(expired.lastResult?.score).toBe(0);
    expect(expired.lastOutcome).toBe("timeout");
  });

  it("records an explicit pass as distinct zero-score feedback", () => {
    const loaded = gameReducer(createInitialGameState("daily"), {
      type: "LOAD_QUESTIONS",
      questions: [question],
    });
    const afterOne = gameReducer(loaded, { type: "PREVIEW_TICK" });
    const afterTwo = gameReducer(afterOne, { type: "PREVIEW_TICK" });
    const answering = gameReducer(afterTwo, { type: "PREVIEW_TICK" });

    const passed = gameReducer(answering, { type: "PASS_QUESTION" });

    expect(passed).toMatchObject({
      phase: "feedback",
      lastOutcome: "pass",
      score: 0,
      depthMetres: 0,
      lastResult: expect.objectContaining({
        accepted: false,
        score: 0,
        quip: expect.stringMatching(/no points lost/i),
      }),
    });
  });

  it("starts the next preview and finishes after the final round", () => {
    const first = gameReducer(createInitialGameState("daily"), {
      type: "LOAD_QUESTIONS",
      questions: [question, { ...question, id: "general-002" }],
    });
    const feedback = gameReducer(first, { type: "TIME_EXPIRED" });
    const next = gameReducer(feedback, { type: "NEXT_ROUND" });
    const finished = gameReducer(next, { type: "TIME_EXPIRED" });

    expect(next).toMatchObject({ phase: "preview", questionIndex: 1 });
    expect(finished.phase).toBe("feedback");

    const summary = gameReducer(finished, { type: "NEXT_ROUND" });
    expect(summary.phase).toBe("summary");
  });
});
