import { describe, expect, it } from "vitest";

import { PACKS } from "../packs/meta";
import { QUESTION_BANK, findQuestionById, minimumPromptsForPack, questionsForPack } from "./catalog";
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

  it("keeps the core atlas free of pack content", () => {
    expect(questionsForPack("core")).toBe(QUESTION_BANK);
    expect(QUESTION_BANK.some((question) => question.id.startsWith("movies-"))).toBe(false);
  });
});

describe("movies atlas", () => {
  const movies = questionsForPack("movies");

  it("holds enough prompts for every mode the pack declares", () => {
    expect(minimumPromptsForPack("movies")).toBe(30);
    expect(movies.length).toBeGreaterThan(minimumPromptsForPack("movies"));
  });

  it("uses only the pack's own topics with pack-scoped ids", () => {
    for (const question of movies) {
      expect(PACKS.movies.topics).toContain(question.category);
      expect(question.id).toMatch(/^movies-\d{3}$/);
    }
    for (const topic of PACKS.movies.topics) {
      expect(movies.filter((question) => question.category === topic).length).toBeGreaterThanOrEqual(6);
    }
  });

  it("keeps sixteen answer families per prompt and an immutable atlas", () => {
    expect(movies.every((question) => question.answers.length >= 16)).toBe(true);
    expect(Object.isFrozen(movies[0])).toBe(true);
  });

  it("resolves movie prompts by id and never collides with core ids", () => {
    expect(findQuestionById("movies-001")?.category).toBe("Genres");
    expect(findQuestionById("general-001")?.category).toBe("General");
    expect(findQuestionById("movies-999")).toBeUndefined();
    const coreIds = new Set(QUESTION_BANK.map((question) => question.id));
    expect(movies.some((question) => coreIds.has(question.id))).toBe(false);
  });

  it("does not ship an atlas for planned packs", () => {
    expect(questionsForPack("sports")).toHaveLength(0);
    expect(questionsForPack("music")).toHaveLength(0);
  });
});
