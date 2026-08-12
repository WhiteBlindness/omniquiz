import { describe, expect, it } from "vitest";

import { NextRequest } from "next/server";

import { GET } from "./route";

describe("GET /api/questions", () => {
  it("returns seven public questions in a success envelope", async () => {
    const response = await GET(new NextRequest("http://localhost/api/questions"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ success: true, error: null });
    expect(body.data).toHaveLength(7);
    expect(body.data[0]).not.toHaveProperty("canonicalAnswer");
    expect(body.data[0]).not.toHaveProperty("acceptedAliases");
  });

  it("keeps daily selection stable while varying unlimited runs", async () => {
    const dailyFirst = await GET(
      new NextRequest("http://localhost/api/questions?mode=daily"),
    );
    const dailySecond = await GET(
      new NextRequest("http://localhost/api/questions?mode=daily"),
    );
    const unlimitedFirst = await GET(
      new NextRequest("http://localhost/api/questions?mode=unlimited&run=1"),
    );
    const unlimitedSecond = await GET(
      new NextRequest("http://localhost/api/questions?mode=unlimited&run=2"),
    );

    const dailyFirstBody = await dailyFirst.json();
    const dailySecondBody = await dailySecond.json();
    const unlimitedFirstBody = await unlimitedFirst.json();
    const unlimitedSecondBody = await unlimitedSecond.json();

    expect(dailyFirstBody.data.map((question: { id: string }) => question.id)).toEqual(
      dailySecondBody.data.map((question: { id: string }) => question.id),
    );
    expect(unlimitedFirstBody.data.map((question: { id: string }) => question.id)).not.toEqual(
      unlimitedSecondBody.data.map((question: { id: string }) => question.id),
    );
  });

  it("validates category and limit query parameters", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/questions?category=Science&limit=3"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(3);
    expect(
      body.data.every((question: { category: string }) => question.category === "Science"),
    ).toBe(true);
  });

  it("applies a supported category to unlimited runs", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost/api/questions?mode=unlimited&run=2&category=History",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(7);
    expect(
      body.data.every((question: { category: string }) => question.category === "History"),
    ).toBe(true);
  });

  it("returns a structured 400 for invalid query parameters", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/questions?category=Mythology&limit=zero"),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      success: false,
      data: null,
      error: expect.any(String),
    });
  });

  it("rejects invalid modes and out-of-range or malformed runs", async () => {
    const invalidMode = await GET(
      new NextRequest("http://localhost/api/questions?mode=weekly"),
    );
    const invalidRun = await GET(
      new NextRequest("http://localhost/api/questions?mode=unlimited&run=0"),
    );
    const decimalRun = await GET(
      new NextRequest("http://localhost/api/questions?mode=unlimited&run=1.5"),
    );
    const oversizedRun = await GET(
      new NextRequest("http://localhost/api/questions?mode=unlimited&run=10001"),
    );

    expect(invalidMode.status).toBe(400);
    expect(invalidRun.status).toBe(400);
    expect(decimalRun.status).toBe(400);
    expect(oversizedRun.status).toBe(400);
  });
});
