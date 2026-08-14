import { describe, expect, it } from "vitest";

import { answerKeys, normalizeAnswer } from "./normalize";

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
  it("accepts bounded article and conservative singular/plural variants", () => {
    const keys = answerKeys("A rocket");

    expect(keys).toEqual(expect.arrayContaining(["arocket", "rocket", "rockets"]));
    expect(answerKeys("the rocket")).toEqual(expect.arrayContaining(["rocket", "rockets"]));
    expect(answerKeys("rockets")).toEqual(expect.arrayContaining(["rocket", "rockets"]));
  });

  it("preserves exact number tokens while normalizing their surface", () => {
    expect(answerKeys("Apollo 11")).toEqual(expect.arrayContaining(["apollo11"]));
    expect(answerKeys("Apollo-11")).toEqual(expect.arrayContaining(["apollo11"]));
    expect(answerKeys("Apollo 1")).not.toContain("apollo11");
  });

  it("never turns cart into car through bounded key expansion", () => {
    expect(answerKeys("cart")).toContain("cart");
    expect(answerKeys("cart")).not.toContain("car");
  });
});
