import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("POST /api/submit", () => {
  it("reveals canonical label, crowd share, tier, points, depth, quip, and comparisons", async () => {
    const response = await POST(
      new Request("http://localhost/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId: "general-001", answer: "shower" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      recognized: true,
      answerLabel: "A shower",
      crowdShare: 19,
      tier: "tooclever",
      score: 15,
      depthMetres: 150,
      quip: expect.any(String),
      commonAnswers: expect.arrayContaining([expect.objectContaining({ label: "Coffee", share: 34 })]),
    });
    expect(body.data).not.toHaveProperty("answers");
    expect(body.data).not.toHaveProperty("acceptedAliases");
  });

  it("returns an uncharted zero-score result for unlisted text", async () => {
    const response = await POST(
      new Request("http://localhost/api/submit", {
        method: "POST",
        body: JSON.stringify({ questionId: "general-001", answer: "purple quantum walrus" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      recognized: false,
      answerLabel: "purple quantum walrus",
      crowdShare: null,
      tier: "uncharted",
      score: 0,
      depthMetres: 0,
    });
  });

  it.each(["rocket", "a rocket", "the rocket", "rockets", "launch vehicle"])(
    "recognizes %s for history-014 through the server evaluator",
    async (answer) => {
      const response = await POST(
        new Request("http://localhost/api/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ questionId: "history-014", answer }),
        }),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toMatchObject({
        recognized: true,
        answerLabel: "A rocket",
        tier: expect.any(String),
        score: expect.any(Number),
      });
    },
  );

  it("keeps bare rock uncharted through the server evaluator", async () => {
    const response = await POST(
      new Request("http://localhost/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId: "history-014", answer: "rock" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      recognized: false,
      tier: "uncharted",
      score: 0,
      depthMetres: 0,
    });
  });

  it("returns 400 for malformed JSON and invalid fields", async () => {
    const malformed = await POST(new Request("http://localhost/api/submit", { method: "POST", body: "not-json" }));
    const invalid = await POST(
      new Request("http://localhost/api/submit", {
        method: "POST",
        body: JSON.stringify({ questionId: "general-001", answer: "   " }),
      }),
    );

    expect(malformed.status).toBe(400);
    expect(invalid.status).toBe(400);
  });

  it("returns 404 for a well-shaped but unknown question id", async () => {
    const response = await POST(
      new Request("http://localhost/api/submit", {
        method: "POST",
        body: JSON.stringify({ questionId: "general-999", answer: "anything" }),
      }),
    );
    expect(response.status).toBe(404);
  });
});
