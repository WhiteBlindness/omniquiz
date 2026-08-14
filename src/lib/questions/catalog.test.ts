import { describe, expect, it } from "vitest";

import { QUESTION_BANK, findQuestionById } from "./catalog";
import { CATEGORIES } from "./types";

describe("production crowd atlas", () => {
  it("contains enough varied prompts and sixteen answer families per prompt", () => {
    expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(120);
    expect(QUESTION_BANK.every((question) => question.answers.length >= 16)).toBe(true);
    for (const category of CATEGORIES) {
      expect(QUESTION_BANK.filter((question) => question.category === category).length).toBeGreaterThanOrEqual(30);
    }
  });

  it("resolves an immutable atlas without a canonical-answer field", () => {
    const question = findQuestionById("science-001");

    expect(question?.id).toBe("science-001");
    expect(question && "canonicalAnswer" in question).toBe(false);
    expect(Object.isFrozen(question)).toBe(true);
  });
});
