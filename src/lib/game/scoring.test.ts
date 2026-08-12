import { describe, expect, it } from "vitest";

import { evaluateSubmission, RARITY_RULES } from "./scoring";

const question = (tier: keyof typeof RARITY_RULES) => ({
  id: `test-${tier}`,
  category: "General" as const,
  prompt: "What is the canonical answer?",
  canonicalAnswer: "São Paulo",
  acceptedAliases: ["sao-paulo", "Sao Paulo city"],
  difficulty: "medium" as const,
  rarity: RARITY_RULES[tier],
});

describe("evaluateSubmission", () => {
  it("accepts normalized canonical answers and awards the tier score", () => {
    const result = evaluateSubmission(question("deepcut"), "  SÃO-PAULO! ");

    expect(result).toMatchObject({
      accepted: true,
      normalizedAnswer: "saopaulo",
      tier: "deepcut",
      score: 85,
      depth: 0.82,
    });
    expect(result.quip.length).toBeGreaterThan(0);
  });

  it("accepts aliases without mutating the question", () => {
    const source = question("plankton");
    const aliasesBefore = [...source.acceptedAliases];

    const result = evaluateSubmission(source, "Sao Paulo city");

    expect(result.accepted).toBe(true);
    expect(source.acceptedAliases).toEqual(aliasesBefore);
  });

  it("returns zero score for an incorrect answer while preserving rarity context", () => {
    const result = evaluateSubmission(question("krillion"), "Mars");

    expect(result).toMatchObject({
      accepted: false,
      normalizedAnswer: "mars",
      tier: "krillion",
      score: 0,
      depth: 0.97,
    });
  });

  it("keeps every tier mapped to the required score and depth", () => {
    expect(RARITY_RULES).toEqual({
      plankton: { tier: "plankton", score: 10, depth: 0.08 },
      tooclever: { tier: "tooclever", score: 15, depth: 0.18 },
      schooler: { tier: "schooler", score: 30, depth: 0.36 },
      rare: { tier: "rare", score: 60, depth: 0.6 },
      deepcut: { tier: "deepcut", score: 85, depth: 0.82 },
      krillion: { tier: "krillion", score: 100, depth: 0.97 },
    });
  });
});
