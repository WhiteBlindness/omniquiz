import { describe, expect, it } from "vitest";

import {
  MINIMUM_FAMILY_COUNT,
  MINIMUM_QUESTION_COUNT,
  QuestionBankValidationError,
  validateQuestionBank,
} from "./validator";

const FAMILY_COUNT = 16;

const answer = (index: number, overrides: Record<string, unknown> = {}) => ({
  label: `Answer ${index}`,
  aliases: [`answer ${index} alternative`, `answer ${index} synonym`],
  share: 100 / FAMILY_COUNT,
  insight: `Reveal insight ${index}`,
  ...overrides,
});

const record = (index: number, overrides: Record<string, unknown> = {}) => ({
  id: `general-${String(index).padStart(3, "0")}`,
  category: "General",
  prompt: `Name a broad thing ${index}`,
  answers: Array.from({ length: FAMILY_COUNT }, (_, answerIndex) => answer(answerIndex + 1)),
  ...overrides,
});

const catalog = () =>
  Array.from({ length: MINIMUM_QUESTION_COUNT }, (_, index) => record(index + 1));

describe("validateQuestionBank", () => {
  it("accepts enough broad prompts and families to supply a full unlimited run", () => {
    const validated = validateQuestionBank(catalog());

    expect(MINIMUM_QUESTION_COUNT).toBeGreaterThanOrEqual(120);
    expect(MINIMUM_FAMILY_COUNT).toBeGreaterThanOrEqual(16);
    expect(validated).toHaveLength(MINIMUM_QUESTION_COUNT);
    expect(validated[0].answers).toHaveLength(MINIMUM_FAMILY_COUNT);
    expect(Object.isFrozen(validated)).toBe(true);
    expect(Object.isFrozen(validated[0])).toBe(true);
    expect(Object.isFrozen(validated[0].answers)).toBe(true);
    expect(Object.isFrozen(validated[0].answers[0].aliases)).toBe(true);
  });

  it("rejects catalogs that cannot supply the new minimum", () => {
    expect(() => validateQuestionBank(catalog().slice(0, MINIMUM_QUESTION_COUNT - 1))).toThrow(/at least/i);
  });

  it("rejects prompts with too few answer families", () => {
    const records = catalog();
    records[0] = record(1, { answers: Array.from({ length: 15 }, (_, index) => answer(index + 1)) });

    expect(() => validateQuestionBank(records)).toThrow(/at least 16.*famil/i);
  });

  it("rejects duplicate normalized aliases across answer families", () => {
    const records = catalog();
    records[0] = record(1, {
      answers: [
        answer(1, { aliases: ["mobile-phone", "phone handset"] }),
        answer(2, { aliases: ["mobile phone", "phone device"] }),
        ...Array.from({ length: 14 }, (_, index) => answer(index + 3)),
      ],
    });

    expect(() => validateQuestionBank(records)).toThrow(QuestionBankValidationError);
    expect(() => validateQuestionBank(records)).toThrow(/duplicate|collision/i);
  });

  it("rejects collisions introduced by article or plural expansion", () => {
    const records = catalog();
    records[0] = record(1, {
      answers: [
        answer(1, { label: "A rocket", aliases: ["launch vehicle", "space rocket"] }),
        answer(2, { label: "Rocket", aliases: ["space launcher", "orbital vehicle"] }),
        ...Array.from({ length: 14 }, (_, index) => answer(index + 3)),
      ],
    });

    expect(() => validateQuestionBank(records)).toThrow(/collision|duplicate/i);
  });

  it("deduplicates equivalent forms within one family", () => {
    const records = catalog();
    records[0] = record(1, {
      answers: [
        answer(1, { label: "Rocket", aliases: ["rocket", "launch vehicle"] }),
        ...Array.from({ length: 15 }, (_, index) => answer(index + 2)),
      ],
    });

    expect(() => validateQuestionBank(records)).not.toThrow();
  });

  it("rejects synthetic choice or response aliases", () => {
    const records = catalog();
    records[0] = record(1, {
      answers: [
        answer(1, { aliases: ["answer 1 choice", "answer 1 alternative"] }),
        ...Array.from({ length: 15 }, (_, index) => answer(index + 2)),
      ],
    });

    expect(() => validateQuestionBank(records)).toThrow(/choice|response/i);
  });

  it("rejects answer distributions that do not total 100 percent", () => {
    const records = catalog();
    records[0] = record(1, {
      answers: Array.from({ length: FAMILY_COUNT }, (_, index) => answer(index + 1, { share: 5 })),
    });

    expect(() => validateQuestionBank(records)).toThrow(/100/i);
  });
});
