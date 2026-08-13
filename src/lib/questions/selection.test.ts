import { describe, expect, it } from "vitest";

import { QUESTION_BANK } from "./catalog";
import { selectDailyQuestions } from "./selection";

describe("selectDailyQuestions", () => {
  it("returns seven unique questions in a stable order for a date", () => {
    const first = selectDailyQuestions(QUESTION_BANK, "2026-08-09", 7);
    const second = selectDailyQuestions(QUESTION_BANK, "2026-08-09", 7);

    expect(first).toHaveLength(7);
    expect(first.map((question) => question.id)).toEqual(second.map((question) => question.id));
    expect(new Set(first.map((question) => question.id)).size).toBe(7);
  });

  it("changes the deterministic selection when the date changes", () => {
    const today = selectDailyQuestions(QUESTION_BANK, "2026-08-09", 7);
    const tomorrow = selectDailyQuestions(QUESTION_BANK, "2026-08-10", 7);
    expect(today.map((question) => question.id)).not.toEqual(tomorrow.map((question) => question.id));
  });

  it("supports a complete fifteen-prompt unlimited run", () => {
    expect(selectDailyQuestions(QUESTION_BANK, "2026-08-09", 15)).toHaveLength(15);
  });

  it("never returns records outside a requested category", () => {
    const questions = selectDailyQuestions(
      QUESTION_BANK.filter((question) => question.category === "History"),
      "2026-08-09",
      15,
    );
    expect(questions).toHaveLength(15);
    expect(questions.every((question) => question.category === "History")).toBe(true);
  });

  it("rejects invalid dates, limits, and undersized catalogs", () => {
    expect(() => selectDailyQuestions(QUESTION_BANK, "2026-02-30", 7)).toThrow(/ISO date/i);
    expect(() => selectDailyQuestions(QUESTION_BANK, "2026-08-09", 0)).toThrow(/positive integer/i);
    expect(() => selectDailyQuestions(QUESTION_BANK.slice(0, 1), "2026-08-09", 7)).toThrow(/enough unique questions/i);
  });
});
