import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("POST /api/submit", () => {
  it("accepts a canonical answer with normalization and scoring metadata", async () => {
    const response = await POST(
      new Request("http://localhost/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId: "general-001", answer: "  SÃO-PAULO! " }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      error: null,
      data: {
        accepted: true,
        normalizedAnswer: "saopaulo",
        tier: expect.any(String),
        score: expect.any(Number),
        quip: expect.any(String),
        depth: expect.any(Number),
      },
    });
  });

  it("accepts a stored alias without leaking the answer", async () => {
    const response = await POST(
      new Request("http://localhost/api/submit", {
        method: "POST",
        body: JSON.stringify({ questionId: "general-001", answer: "Sao Paulo city" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.accepted).toBe(true);
    expect(body.data).not.toHaveProperty("canonicalAnswer");
    expect(body.data).not.toHaveProperty("acceptedAliases");
  });

  it("returns 400 for malformed JSON and invalid fields", async () => {
    const malformed = await POST(
      new Request("http://localhost/api/submit", {
        method: "POST",
        body: "not-json",
      }),
    );
    const malformedBody = await malformed.json();

    expect(malformed.status).toBe(400);
    expect(malformedBody).toEqual({
      success: false,
      data: null,
      error: expect.any(String),
    });

    const invalid = await POST(
      new Request("http://localhost/api/submit", {
        method: "POST",
        body: JSON.stringify({ questionId: "general-001", answer: "   " }),
      }),
    );

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
