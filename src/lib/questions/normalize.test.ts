import { describe, expect, it } from "vitest";

import { normalizeAnswer } from "./normalize";

describe("normalizeAnswer", () => {
  it("removes case, punctuation, whitespace, and diacritics", () => {
    expect(normalizeAnswer("  Crème brûlée! ")).toBe("cremebrulee");
  });

  it("treats punctuation and spacing variants as the same answer", () => {
    expect(normalizeAnswer("New-York")).toBe(normalizeAnswer("new york"));
  });

  it("is deterministic for empty input", () => {
    expect(normalizeAnswer("")).toBe("");
  });

  it("does not change the source string", () => {
    const answer = " São Paulo ";

    normalizeAnswer(answer);

    expect(answer).toBe(" São Paulo ");
  });
});
