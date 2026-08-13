import { describe, expect, it } from "vitest";

import { QUESTION_BANK } from "./catalog";
import { getDifficultyForRound, selectDailyQuestions } from "./selection";

describe("selectDailyQuestions", () => {
  it("returns seven unique questions in a stable order for a date", () => {
    const first = selectDailyQuestions(QUESTION_BANK, "2026-08-09", 7);
    const second = selectDailyQuestions(QUESTION_BANK, "2026-08-09", 7);

    expect(first).toHaveLength(7);
    expect(first.map((question) => question.id)).toEqual(
      second.map((question) => question.id),
    );
    expect(new Set(first.map((question) => question.id)).size).toBe(7);
  });

  it("changes the deterministic selection when the date changes", () => {
    const today = selectDailyQuestions(QUESTION_BANK, "2026-08-09", 7);
    const tomorrow = selectDailyQuestions(QUESTION_BANK, "2026-08-10", 7);

    expect(today.map((question) => question.id)).not.toEqual(
      tomorrow.map((question) => question.id),
    );
  });

  it("uses Easy for rounds 1-3 and Medium for rounds 4-7", () => {
    const questions = selectDailyQuestions(QUESTION_BANK, "2026-08-09", 7);

    expect(questions.map((question) => question.difficulty)).toEqual([
      "easy",
      "easy",
      "easy",
      "medium",
      "medium",
      "medium",
      "medium",
    ]);
  });

  it("uses Hard for round 8 and every later round", () => {
    const questions = selectDailyQuestions(QUESTION_BANK, "2026-08-09", 10);

    expect(questions.slice(7).every((question) => question.difficulty === "hard")).toBe(true);
  });

  it("keeps Hard questions behind round seven", () => {
    expect([1, 3, 4, 7, 8, 100].map(getDifficultyForRound)).toEqual([
      "easy",
      "easy",
      "medium",
      "medium",
      "hard",
      "hard",
    ]);
  });

  it("does not backfill a missing progression tier with another difficulty", () => {
    const hardQuestions = QUESTION_BANK.filter((question) => question.difficulty === "hard");

    expect(() =>
      selectDailyQuestions(hardQuestions, "2026-08-09", 1),
    ).toThrow(/easy/i);
  });

  it("never returns records outside a requested category", () => {
    const questions = selectDailyQuestions(
      QUESTION_BANK.filter((question) => question.category === "History"),
      "2026-08-09",
      4,
    );

    expect(questions).toHaveLength(4);
    expect(
      questions.every((question) => question.category === "History"),
    ).toBe(true);
  });

  it("rejects invalid dates, limits, and undersized catalogs", () => {
    expect(() =>
      selectDailyQuestions(QUESTION_BANK, "2026-02-30", 7),
    ).toThrow(/ISO date/i);
    expect(() =>
      selectDailyQuestions(QUESTION_BANK, "2026-08-09", 0),
    ).toThrow(/positive integer/i);
    expect(() =>
      selectDailyQuestions(QUESTION_BANK.slice(0, 1), "2026-08-09", 7),
    ).toThrow(/enough unique questions/i);
  });
});
