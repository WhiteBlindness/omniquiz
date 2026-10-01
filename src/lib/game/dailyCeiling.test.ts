import { describe, expect, it } from "vitest";

import { DAILY_SCORE_CEILING, getDailyScoreShare } from "./dailyCeiling";

describe("getDailyScoreShare", () => {
  it("derives the ceiling from seven prompts at the top tier", () => {
    expect(DAILY_SCORE_CEILING).toBe(700);
  });

  it("reports the share of the daily maximum, not a player ranking", () => {
    expect(getDailyScoreShare(0)).toBe(0);
    expect(getDailyScoreShare(350)).toBe(50);
    expect(getDailyScoreShare(700)).toBe(100);
  });

  it("clamps invalid and out-of-range scores", () => {
    expect(getDailyScoreShare(-50)).toBe(0);
    expect(getDailyScoreShare(Number.NaN)).toBe(0);
    expect(getDailyScoreShare(7_000)).toBe(100);
  });
});
