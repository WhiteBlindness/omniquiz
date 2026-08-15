import { describe, expect, it } from "vitest";

import {
  getUtcDateKey,
  getUtcDayOfYear,
  isIsoDate,
  offsetIsoDate,
} from "./date";

describe("UTC date helpers", () => {
  it("formats timestamps as pure UTC calendar keys", () => {
    expect(getUtcDateKey(Date.UTC(2026, 7, 15, 23, 59, 59))).toBe("2026-08-15");
    expect(getUtcDateKey(Date.UTC(2026, 7, 16, 0, 0, 0))).toBe("2026-08-16");
  });

  it("accepts only round-tripping ISO calendar dates", () => {
    expect(isIsoDate("2026-08-15")).toBe(true);
    expect(isIsoDate("2024-02-29")).toBe(true);
    expect(isIsoDate("2026-02-29")).toBe(false);
    expect(isIsoDate("2026-8-15")).toBe(false);
    expect(isIsoDate("2026-08-15T00:00:00.000Z")).toBe(false);
  });

  it("offsets dates and labels leap-year boundaries without local timezone state", () => {
    expect(offsetIsoDate("2024-02-29", 1)).toBe("2024-03-01");
    expect(offsetIsoDate("2026-12-31", 1)).toBe("2027-01-01");
    expect(getUtcDayOfYear("2024-02-29")).toBe(60);
    expect(() => getUtcDayOfYear("2026-02-29")).toThrow(/ISO date/i);
  });
});
