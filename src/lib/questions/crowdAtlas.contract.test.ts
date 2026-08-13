import { describe, expect, it } from "vitest";

import { toPublicQuestion } from "./public";
import {
  MINIMUM_QUESTION_COUNT,
  QuestionBankValidationError,
  validateQuestionBank,
} from "./validator";

const answer = (index: number, overrides: Record<string, unknown> = {}) => ({
  label: `Answer ${index}`,
  aliases: [`alias ${index}`],
  share: 12.5,
  insight: `Reveal insight ${index}`,
  ...overrides,
});

const record = (index: number, overrides: Record<string, unknown> = {}) => ({
  id: `general-${String(index).padStart(3, "0")}`,
  category: "General",
  prompt: `Name a broad thing ${index}`,
  answers: Array.from({ length: 8 }, (_, answerIndex) => answer(answerIndex + 1)),
  ...overrides,
});

const catalog = () =>
  Array.from({ length: MINIMUM_QUESTION_COUNT }, (_, index) => record(index + 1));

describe("crowd atlas catalog contract", () => {
  it("accepts enough broad prompts to supply a full unlimited run", () => {
    const validated = validateQuestionBank(catalog());
    expect(MINIMUM_QUESTION_COUNT).toBeGreaterThanOrEqual(15);
    expect(validated).toHaveLength(MINIMUM_QUESTION_COUNT);
    expect(Object.isFrozen(validated[0].answers)).toBe(true);
    expect(Object.isFrozen(validated[0].answers[0].aliases)).toBe(true);
  });

  it("rejects duplicate normalized aliases across answer families", () => {
    const records = catalog();
    records[0] = record(1, {
      answers: [
        answer(1, { aliases: ["mobile-phone"] }),
        answer(2, { aliases: ["mobile phone"] }),
        ...Array.from({ length: 6 }, (_, index) => answer(index + 3)),
      ],
    });
    expect(() => validateQuestionBank(records)).toThrow(QuestionBankValidationError);
    expect(() => validateQuestionBank(records)).toThrow(/duplicate.*answer|alias/i);
  });

  it("rejects answer distributions that do not total 100 percent", () => {
    const records = catalog();
    records[0] = record(1, {
      answers: Array.from({ length: 8 }, (_, index) => answer(index + 1, { share: 5 })),
    });
    expect(() => validateQuestionBank(records)).toThrow(/100/i);
  });

  it("never exposes the answer atlas in a public question", () => {
    const [question] = validateQuestionBank(catalog());
    const publicQuestion = toPublicQuestion(question);
    expect(publicQuestion).toEqual({
      id: question.id,
      category: question.category,
      prompt: question.prompt,
    });
    expect(publicQuestion).not.toHaveProperty("answers");
  });
});
