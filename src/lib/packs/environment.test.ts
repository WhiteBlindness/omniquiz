import { describe, expect, it } from "vitest";

import {
  ENVIRONMENTS,
  isLiveEnvironment,
  routeProgress,
  stageIndexFor,
  type Lexicon,
} from "./environment";
import { PACK_LIST } from "./meta";

const collectStrings = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === "object") {
    // `tier` holds internal identifiers shared with the core scoring tiers, not display text.
    for (const [key, item] of Object.entries(value)) if (key !== "tier") collectStrings(item, out);
  }
  return out;
};

const OCEAN_TERMS = /\b(dive|diving|depth|descent|descend|descending|surface|shallows|open water|ocean|submarine|rov|abyss|expedition|metres|uncharted|signal)\b/i;

// Wording and names from the third-party game that inspired OMNIQUIZ; none of it may ship.
const INSPIRATION_WORDING =
  /krillion|plankton|schooler|too clever|sinks? (you )?deeper|begin descent|daily dive|arcade dive|endless dive|one in a|type one answer|themed packs|logbook|now showing|at the movies|same for everyone/i;

describe("pack environments", () => {
  it("gives every live pack an environment with a renderer and a lexicon", () => {
    for (const pack of PACK_LIST.filter((entry) => entry.status === "live")) {
      expect(isLiveEnvironment(pack.environment), pack.id).toBe(true);
    }
    expect(Object.keys(ENVIRONMENTS).sort()).toEqual(["cinema", "ocean"]);
  });

  it("reserves environments for planned packs without shipping renderers for them", () => {
    const planned = PACK_LIST.filter((pack) => pack.status === "planned").map((pack) => pack.environment);
    expect(planned.sort()).toEqual(["stadium", "venue"]);
    for (const id of planned) expect(isLiveEnvironment(id)).toBe(false);
  });

  it("gives the ocean world its own expedition wording", () => {
    const { lexicon } = ENVIRONMENTS.ocean;
    expect(lexicon.begin.daily).toBe("LAUNCH THE ROV");
    expect(lexicon.begin.survival).toBe("ENTER THE ABYSS");
    expect(lexicon.submit.unlimited).toBe("SEND");
    expect(lexicon.submit.speed).toBe("LOCK");
    expect(lexicon.nextPrompt.unlimited).toBe("NEXT PROMPT");
    expect(lexicon.lastPrompt.unlimited).toBe("RECOVER THE ROV");
    expect(lexicon.logName.survival).toBe("THREAT LOG");
    expect(lexicon.tierHeading.unique).toBe("THE ABYSS");
    expect(lexicon.travel?.label).toBe("DEPTH");
  });

  it("ships no wording borrowed from the game that inspired OMNIQUIZ", () => {
    const shipped = [
      ...collectStrings(ENVIRONMENTS.ocean.lexicon),
      ...collectStrings(ENVIRONMENTS.cinema.lexicon),
      ...collectStrings(ENVIRONMENTS.cinema.stages),
      ...collectStrings(PACK_LIST),
    ];
    for (const text of shipped) expect(text, text).not.toMatch(INSPIRATION_WORDING);
  });

  it("never lets ocean vocabulary into the cinema lexicon", () => {
    const strings = collectStrings(ENVIRONMENTS.cinema.lexicon);
    expect(strings.length).toBeGreaterThan(50);
    for (const text of strings) expect(text, text).not.toMatch(OCEAN_TERMS);
    const stages = collectStrings(ENVIRONMENTS.cinema.stages);
    for (const text of stages) expect(text, text).not.toMatch(OCEAN_TERMS);
  });

  it("covers every game mode in each mode-keyed lexicon table", () => {
    const modes = ["daily", "unlimited", "speed", "survival"] as const;
    for (const environment of Object.values(ENVIRONMENTS)) {
      const lexicon: Lexicon = environment.lexicon;
      for (const table of [
        lexicon.modeTitle, lexicon.modeDescription, lexicon.hudAria, lexicon.feedPlate, lexicon.begin,
        lexicon.submit, lexicon.nextPrompt, lexicon.lastPrompt, lexicon.previewVerb, lexicon.logName,
        lexicon.logAria, lexicon.summaryTitle, lexicon.summarySr, lexicon.replay, lexicon.promptHint,
        lexicon.noMatchNote,
      ]) {
        for (const mode of modes) expect(table[mode], `${environment.id}.${mode}`).toBeTruthy();
      }
      for (const mode of modes) expect(lexicon.rules[mode].length).toBeGreaterThanOrEqual(5);
    }
  });

  it("shows stages instead of depth in the cinema and depth in the ocean", () => {
    expect(ENVIRONMENTS.cinema.lexicon.travel).toBeNull();
    expect(ENVIRONMENTS.cinema.stages).toHaveLength(5);
    expect(ENVIRONMENTS.ocean.lexicon.travel).not.toBeNull();
    expect(ENVIRONMENTS.ocean.stages).toBeNull();
  });
});

describe("route progress", () => {
  it("is zero before a run and follows the prompt position during it", () => {
    expect(routeProgress("intro", 0, 15)).toBe(0);
    expect(routeProgress("loading", 3, 15)).toBe(0);
    expect(routeProgress("answering", 0, 15)).toBe(0);
    expect(routeProgress("answering", 7, 15)).toBeCloseTo(0.5);
    expect(routeProgress("feedback", 14, 15)).toBe(1);
  });

  it("shows partial progress when a survival run ends early", () => {
    expect(routeProgress("summary", 7, 30)).toBeCloseTo(7 / 29);
    expect(routeProgress("summary", 7, 30)).toBeLessThan(1);
  });

  it("clamps out-of-range and degenerate inputs", () => {
    expect(routeProgress("answering", 99, 15)).toBe(1);
    expect(routeProgress("answering", -3, 15)).toBe(0);
    expect(routeProgress("answering", 0, 1)).toBe(0);
    expect(routeProgress("answering", 0, 0)).toBe(0);
  });

  it("maps progress onto stages including both ends", () => {
    const stages = ENVIRONMENTS.cinema.stages!;
    expect(stageIndexFor(stages, 0)).toBe(0);
    expect(stageIndexFor(stages, 0.19)).toBe(0);
    expect(stageIndexFor(stages, 0.2)).toBe(1);
    expect(stageIndexFor(stages, 0.5)).toBe(2);
    expect(stageIndexFor(stages, 0.79)).toBe(3);
    expect(stageIndexFor(stages, 1)).toBe(4);
  });
});
