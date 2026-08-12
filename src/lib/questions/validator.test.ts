import { describe, expect, it } from "vitest";

import {
  EXPECTED_QUESTION_COUNT,
  QuestionBankValidationError,
  validateQuestionBank,
} from "./validator";

const validRecord = (overrides: Record<string, unknown> = {}) => ({
  id: "general-001",
  category: "General",
  prompt: "Which color is made by mixing blue and yellow?",
  canonicalAnswer: "green",
  acceptedAliases: ["green hue"],
  difficulty: "easy",
  rarity: { tier: "plankton", score: 10, depth: 0.08 },
  ...overrides,
});

describe("validateQuestionBank", () => {
  it("requires the exact production record count", () => {
    expect(() => validateQuestionBank([validRecord()])).toThrow(
      QuestionBankValidationError,
    );
    expect(EXPECTED_QUESTION_COUNT).toBe(300);
  });

  it("rejects duplicate ids and normalized prompts", () => {
    const records = Array.from({ length: 300 }, (_, index) =>
      validRecord({
        id: `general-${String(index + 1).padStart(3, "0")}`,
        prompt: `Prompt ${index + 1}`,
      }),
    );

    records[1] = { ...records[1], id: records[0].id };

    expect(() => validateQuestionBank(records)).toThrow(/duplicate id/i);
  });

  it("rejects mismatched rarity scores and depth factors", () => {
    const records = Array.from({ length: 300 }, (_, index) =>
      validRecord({
        id: `general-${String(index + 1).padStart(3, "0")}`,
        prompt: `Prompt ${index + 1}`,
      }),
    );

    records[0] = {
      ...records[0],
      rarity: { tier: "rare", score: 10, depth: 0.08 },
    };

    expect(() => validateQuestionBank(records)).toThrow(/rarity/i);
  });

  it("returns deeply immutable records after validation", () => {
    const records = Array.from({ length: 300 }, (_, index) =>
      validRecord({
        id: `general-${String(index + 1).padStart(3, "0")}`,
        prompt: `Prompt ${index + 1}`,
      }),
    );

    const validated = validateQuestionBank(records);

    expect(Object.isFrozen(validated)).toBe(true);
    expect(Object.isFrozen(validated[0])).toBe(true);
    expect(Object.isFrozen(validated[0].acceptedAliases)).toBe(true);
    expect(Object.isFrozen(validated[0].rarity)).toBe(true);
  });
});
