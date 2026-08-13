import { describe, expect, it } from "vitest";

import {
  evaluateSubmission,
  rarityForCrowdShare,
} from "./scoring";
import type { Question } from "../questions/types";

const prompt: Question = Object.freeze({
  id: "general-001",
  category: "General",
  prompt: "Name something people do when they cannot sleep.",
  answers: Object.freeze([
    Object.freeze({
      label: "Check their phone",
      aliases: Object.freeze(["scroll", "use my phone", "phone"]),
      share: 34,
      insight: "The glowing rectangle wins the midnight vote.",
    }),
    Object.freeze({
      label: "Read",
      aliases: Object.freeze(["read a book", "reading"]),
      share: 19,
      insight: "A familiar route back toward sleep.",
    }),
    Object.freeze({
      label: "Count backwards",
      aliases: Object.freeze(["count sheep", "counting sheep"]),
      share: 10,
      insight: "The classic answer still travels in a school.",
    }),
    Object.freeze({
      label: "Rearrange the room",
      aliases: Object.freeze(["move furniture"]),
      share: 6,
      insight: "Restlessness becomes interior design.",
    }),
    Object.freeze({
      label: "Take a cold shower",
      aliases: Object.freeze(["cold shower"]),
      share: 2.5,
      insight: "A surprisingly bracing deep cut.",
    }),
    Object.freeze({
      label: "Listen to train sounds",
      aliases: Object.freeze(["train noises"]),
      share: 1,
      insight: "A tiny crowd rides this night train.",
    }),
    Object.freeze({
      label: "Make tea",
      aliases: Object.freeze(["tea"]),
      share: 12,
      insight: "A warm cup joins the night shift.",
    }),
    Object.freeze({
      label: "Walk around",
      aliases: Object.freeze(["walk"]),
      share: 15.5,
      insight: "Some sleepers reset by moving.",
    }),
  ]),
});

describe("crowd-rarity scoring contract", () => {
  it.each([
    [30, "plankton", 10],
    [18, "tooclever", 15],
    [10, "schooler", 30],
    [5, "rare", 60],
    [2, "deepcut", 85],
    [1.99, "krillion", 100],
  ] as const)("derives %s%% share as %s", (share, tier, score) => {
    expect(rarityForCrowdShare(share)).toEqual({
      tier,
      score,
      depthMetres: score * 10,
    });
  });

  it("scores an alias from its answer share and reveals useful comparison data", () => {
    const result = evaluateSubmission(prompt, "  TRAIN noises! ");

    expect(result).toMatchObject({
      recognized: true,
      normalizedAnswer: "trainnoises",
      answerLabel: "Listen to train sounds",
      crowdShare: 1,
      tier: "krillion",
      score: 100,
      depthMetres: 1_000,
      quip: "A tiny crowd rides this night train.",
    });
    expect(result.commonAnswers.slice(0, 2)).toEqual([
      { label: "Check their phone", share: 34 },
      { label: "Read", share: 19 },
    ]);
  });

  it("treats unlisted text as uncharted instead of rewarding nonsense", () => {
    expect(evaluateSubmission(prompt, "purple quantum walrus")).toMatchObject({
      recognized: false,
      answerLabel: "purple quantum walrus",
      crowdShare: null,
      tier: "uncharted",
      score: 0,
      depthMetres: 0,
    });
  });

  it("does not mutate the prompt atlas", () => {
    const before = JSON.stringify(prompt);
    evaluateSubmission(prompt, "phone");
    expect(JSON.stringify(prompt)).toBe(before);
  });
});
