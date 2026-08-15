import { describe, expect, it } from "vitest";

import { NextRequest } from "next/server";

import { GET, getUtcDayOfYear } from "./route";

describe("GET /api/questions", () => {
  it("labels UTC calendar boundaries and leap years correctly", () => {
    expect(getUtcDayOfYear("2026-01-01")).toBe(1);
    expect(getUtcDayOfYear("2024-02-29")).toBe(60);
    expect(getUtcDayOfYear("2024-12-31")).toBe(366);
    expect(getUtcDayOfYear("2026-12-31")).toBe(365);
  });

  it("returns seven questions with only public prompt fields", async () => {
    const response = await GET(new NextRequest("http://localhost/api/questions"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(response.headers.get("x-omniquiz-day")).toMatch(/^\d{3}$/);
    expect(response.headers.get("x-omniquiz-date")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.data).toHaveLength(7);
    expect(Object.keys(body.data[0]).sort()).toEqual(["category", "id", "prompt"]);
    expect(body.data[0]).not.toHaveProperty("answers");
  });

  it("keeps daily selection stable while varying unlimited runs", async () => {
    const dailyFirst = await GET(new NextRequest("http://localhost/api/questions?mode=daily"));
    const dailySecond = await GET(new NextRequest("http://localhost/api/questions?mode=daily"));
    const unlimitedFirst = await GET(new NextRequest("http://localhost/api/questions?mode=unlimited&run=1"));
    const unlimitedSecond = await GET(new NextRequest("http://localhost/api/questions?mode=unlimited&run=2"));
    const dailyFirstBody = await dailyFirst.json();
    const dailySecondBody = await dailySecond.json();
    const unlimitedFirstBody = await unlimitedFirst.json();
    const unlimitedSecondBody = await unlimitedSecond.json();

    expect(dailyFirstBody.data.map((question: { id: string }) => question.id)).toEqual(
      dailySecondBody.data.map((question: { id: string }) => question.id),
    );
    expect(unlimitedFirstBody.data).toHaveLength(15);
    expect(unlimitedSecondBody.data).toHaveLength(15);
    expect(unlimitedFirstBody.data.map((question: { id: string }) => question.id)).not.toEqual(
      unlimitedSecondBody.data.map((question: { id: string }) => question.id),
    );
  });

  it("uses an explicit UTC date as the daily identity and changes adjacent selections", async () => {
    const first = await GET(
      new NextRequest("http://localhost/api/questions?mode=daily&date=2026-08-09"),
    );
    const next = await GET(
      new NextRequest("http://localhost/api/questions?mode=daily&date=2026-08-10"),
    );
    const firstBody = await first.json();
    const nextBody = await next.json();

    expect(first.status).toBe(200);
    expect(next.status).toBe(200);
    expect(first.headers.get("x-omniquiz-date")).toBe("2026-08-09");
    expect(next.headers.get("x-omniquiz-date")).toBe("2026-08-10");
    expect(first.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(next.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(firstBody.data.map((question: { id: string }) => question.id)).not.toEqual(
      nextBody.data.map((question: { id: string }) => question.id),
    );
  });

  it("keeps unlimited run selection tied to run rather than the optional date", async () => {
    const withoutDate = await GET(
      new NextRequest("http://localhost/api/questions?mode=unlimited&run=2"),
    );
    const withDate = await GET(
      new NextRequest("http://localhost/api/questions?mode=unlimited&run=2&date=2001-01-01"),
    );
    const withoutDateBody = await withoutDate.json();
    const withDateBody = await withDate.json();

    expect(withDateBody.data.map((question: { id: string }) => question.id)).toEqual(
      withoutDateBody.data.map((question: { id: string }) => question.id),
    );
  });

  it("serves a complete unlimited run without difficulty or correctness metadata", async () => {
    const response = await GET(new NextRequest("http://localhost/api/questions?mode=unlimited&run=1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(15);
    expect(body.data.every((question: Record<string, unknown>) => !("difficulty" in question))).toBe(true);
  });

  it("applies a supported category to a full unlimited run", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/questions?mode=unlimited&run=2&category=History"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(15);
    expect(body.data.every((question: { category: string }) => question.category === "History")).toBe(true);
  });

  it("validates category, mode, limit, and run query parameters", async () => {
    const invalidCategory = await GET(new NextRequest("http://localhost/api/questions?category=Mythology"));
    const invalidMode = await GET(new NextRequest("http://localhost/api/questions?mode=weekly"));
    const invalidRun = await GET(new NextRequest("http://localhost/api/questions?mode=unlimited&run=0"));
    const invalidLimit = await GET(new NextRequest("http://localhost/api/questions?limit=0"));
    const invalidDate = await GET(
      new NextRequest("http://localhost/api/questions?mode=daily&date=2026-02-30"),
    );

    expect(invalidCategory.status).toBe(400);
    expect(invalidMode.status).toBe(400);
    expect(invalidRun.status).toBe(400);
    expect(invalidLimit.status).toBe(400);
    expect(invalidDate.status).toBe(400);
    expect(invalidDate.headers.get("cache-control")).toBe("no-store, max-age=0");
  });
});
