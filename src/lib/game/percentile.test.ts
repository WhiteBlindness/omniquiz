import { describe, expect, it } from "vitest";

import { getEstimatedDailyPercentile } from "./percentile";

describe("getEstimatedDailyPercentile", () => {
  it("maps the daily score ceiling to the top displayed percentile", () => {
    expect(getEstimatedDailyPercentile(700)).toBe(99);
  });

  it("changes as the earned score changes", () => {
    expect(getEstimatedDailyPercentile(60)).toBeGreaterThan(
      getEstimatedDailyPercentile(10),
    );
  });

  it("clamps invalid and out-of-range scores", () => {
    expect(getEstimatedDailyPercentile(-50)).toBe(1);
    expect(getEstimatedDailyPercentile(Number.NaN)).toBe(1);
    expect(getEstimatedDailyPercentile(7_000)).toBe(99);
  });
});
