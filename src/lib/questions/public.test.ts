import { describe, expect, it } from "vitest";

import { findQuestionById } from "./catalog";
import { toPublicQuestion } from "./public";

describe("toPublicQuestion", () => {
  it("returns only fields safe for clients", () => {
    const question = findQuestionById("general-001");

    expect(question).toBeDefined();

    const publicQuestion = toPublicQuestion(question!);

    expect(publicQuestion).toMatchObject({
      id: "general-001",
      category: "General",
      prompt: expect.any(String),
      difficulty: expect.any(String),
      rarity: expect.any(Object),
    });
    expect(publicQuestion).not.toHaveProperty("canonicalAnswer");
    expect(publicQuestion).not.toHaveProperty("acceptedAliases");
  });
});
