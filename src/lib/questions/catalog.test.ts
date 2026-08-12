import { describe, expect, it } from "vitest";

import { QUESTION_BANK, findQuestionById } from "./catalog";
import { CATEGORIES } from "./types";

describe("production question catalog", () => {
  it("contains 300 questions balanced across the four categories", () => {
    expect(QUESTION_BANK).toHaveLength(300);

    for (const category of CATEGORIES) {
      expect(
        QUESTION_BANK.filter((question) => question.category === category),
      ).toHaveLength(75);
    }
  });

  it("has stable ids and resolves a question without exposing mutable data", () => {
    const question = findQuestionById("science-001");

    expect(question?.id).toBe("science-001");
    expect(question && "canonicalAnswer" in question).toBe(true);
    expect(Object.isFrozen(question)).toBe(true);
  });
});
