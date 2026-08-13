import { describe, expect, it } from "vitest";

import { findQuestionById } from "./catalog";
import { toPublicQuestion } from "./public";

describe("toPublicQuestion", () => {
  it("returns exactly the prompt fields safe for clients", () => {
    const question = findQuestionById("general-001");
    expect(question).toBeDefined();

    expect(toPublicQuestion(question!)).toEqual({
      id: question!.id,
      category: question!.category,
      prompt: question!.prompt,
    });
  });
});
