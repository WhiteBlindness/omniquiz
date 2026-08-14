import { describe, expect, it } from "vitest";

import { QUESTION_BANK, findQuestionById } from "./catalog";
import { answerKeys } from "./normalize";
import { toPublicQuestion } from "./public";
import { CATEGORIES } from "./types";

const acceptedKeysFor = (family: { label: string; aliases: readonly string[] }) =>
  new Set([family.label, ...family.aliases].flatMap((surface) => answerKeys(surface)));

describe("production crowd atlas contract", () => {
  it("contains 120 broad prompts balanced across all four categories", () => {
    expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(120);

    for (const category of CATEGORIES) {
      expect(QUESTION_BANK.filter((question) => question.category === category).length).toBeGreaterThanOrEqual(30);
    }
  });

  it("contains curated families, aliases, and bounded accepted keys", () => {
    expect(QUESTION_BANK.every((question) => question.answers.length >= 16)).toBe(true);

    for (const question of QUESTION_BANK) {
      for (const family of question.answers) {
        expect(family.aliases.length).toBeGreaterThanOrEqual(2);
        expect(acceptedKeysFor(family).size).toBeGreaterThanOrEqual(4);
        expect(family.aliases.every((alias) => !/(?:choice|response)$/i.test(alias.trim()))).toBe(true);
      }
    }
  });

  it("preserves positive shares, exact totals, and every rarity band", () => {
    const bands = new Set<string>();

    for (const question of QUESTION_BANK) {
      expect(question.answers.every((family) => family.share > 0)).toBe(true);
      expect(question.answers.reduce((total, family) => total + family.share, 0)).toBeCloseTo(100, 6);

      for (const family of question.answers) {
        bands.add(
          family.share >= 30
            ? "plankton"
            : family.share >= 18
              ? "tooclever"
              : family.share >= 10
                ? "schooler"
                : family.share >= 5
                  ? "rare"
                  : family.share >= 2
                    ? "deepcut"
                    : "krillion",
        );
      }
    }

    expect(bands).toEqual(new Set(["plankton", "tooclever", "schooler", "rare", "deepcut", "krillion"]));
  });

  it("keeps the rocket family safe and explicit", () => {
    const rocket = findQuestionById("history-014")?.answers.find((family) => family.label === "A rocket");

    expect(rocket).toBeDefined();
    expect(rocket?.aliases).toContain("launch vehicle");
    expect(rocket?.aliases).not.toContain("rock");
  });

  it("never exposes the answer atlas in a public question", () => {
    const question = findQuestionById("history-014");
    expect(question).toBeDefined();

    const publicQuestion = toPublicQuestion(question!);
    expect(Object.keys(publicQuestion).sort()).toEqual(["category", "id", "prompt"]);
    expect(publicQuestion).not.toHaveProperty("answers");
    expect(publicQuestion).not.toHaveProperty("aliases");
    expect(publicQuestion).not.toHaveProperty("share");
    expect(publicQuestion).not.toHaveProperty("insight");
  });
});
