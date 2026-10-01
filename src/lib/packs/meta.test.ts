import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  PACKS,
  PACK_IDS,
  PACK_LIST,
  getLivePackBySlug,
  isLivePackId,
  isPackId,
  isPackTopic,
  packHref,
  packSupportsMode,
  resolvePackMode,
} from "./meta";

describe("pack metadata", () => {
  it("registers every pack under its own id", () => {
    for (const id of PACK_IDS) expect(PACKS[id].id).toBe(id);
    expect(PACK_LIST).toHaveLength(PACK_IDS.length);
  });

  it("keeps live packs runnable and planned packs inert", () => {
    for (const pack of PACK_LIST) {
      if (pack.status === "live") {
        expect(pack.modes.length).toBeGreaterThan(0);
        expect(pack.defaultMode).not.toBeNull();
        expect(pack.modes).toContain(pack.defaultMode);
        expect(pack.topics.length).toBeGreaterThan(0);
      } else {
        expect(pack.modes).toHaveLength(0);
        expect(pack.defaultMode).toBeNull();
        expect(pack.topics).toHaveLength(0);
      }
    }
  });

  it("gives every pack a card description and a distinct environment", () => {
    for (const pack of PACK_LIST) expect(pack.cardDetail.length, pack.id).toBeGreaterThan(20);
    expect(new Set(PACK_LIST.map((pack) => pack.environment)).size).toBe(PACK_LIST.length);
  });

  it("keeps the core taxonomy separate from pack topics", () => {
    expect(PACKS.core.topics).toEqual(["General", "Science", "Geography", "History"]);
    for (const topic of PACKS.movies.topics) expect(PACKS.core.topics).not.toContain(topic);
  });

  it("scopes mode support to the pack", () => {
    expect(packSupportsMode("core", "daily")).toBe(true);
    expect(packSupportsMode("movies", "daily")).toBe(false);
    expect(packSupportsMode("movies", "speed")).toBe(true);
    expect(packSupportsMode("sports", "unlimited")).toBe(false);
  });

  it("recognises only live packs and known slugs", () => {
    expect(isPackId("movies")).toBe(true);
    expect(isPackId("polka")).toBe(false);
    expect(isLivePackId("movies")).toBe(true);
    expect(isLivePackId("sports")).toBe(false);
    expect(getLivePackBySlug("movies")?.id).toBe("movies");
    expect(getLivePackBySlug("sports")).toBeUndefined();
    expect(getLivePackBySlug("core")).toBeUndefined();
    expect(getLivePackBySlug("../etc")).toBeUndefined();
  });

  it("validates topics per pack", () => {
    expect(isPackTopic("core", "History")).toBe(true);
    expect(isPackTopic("core", "Genres")).toBe(false);
    expect(isPackTopic("movies", "Genres")).toBe(true);
    expect(isPackTopic("movies", "History")).toBe(false);
    expect(isPackTopic("movies", 12)).toBe(false);
  });

  it("falls back to the pack default for unsupported requested modes", () => {
    const movies = PACKS.movies;
    expect(resolvePackMode(movies, "speed")).toBe("speed");
    expect(resolvePackMode(movies, "daily")).toBe("unlimited");
    expect(resolvePackMode(movies, "nonsense")).toBe("unlimited");
    expect(resolvePackMode(movies, undefined)).toBe("unlimited");
  });

  it("builds canonical routes for core and pack modes", () => {
    expect(packHref("core", "daily")).toBe("/");
    expect(packHref("core", "survival")).toBe("/survival");
    expect(packHref("movies", "unlimited")).toBe("/packs/movies");
    expect(packHref("movies", "speed")).toBe("/packs/movies?mode=speed");
  });

  it("stays free of atlas and catalog imports so it is safe for the browser", () => {
    const source = readFileSync(resolve(process.cwd(), "src/lib/packs/meta.ts"), "utf8");
    expect(source).not.toMatch(/questions\/catalog|src\/data|\.json|QUESTION_BANK|findQuestionById/);
  });
});
