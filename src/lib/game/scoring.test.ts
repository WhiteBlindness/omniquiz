import { describe, expect, it } from "vitest";

import {
  evaluateSubmission,
  rarityForCrowdShare,
} from "./scoring";
import { findQuestionById } from "../questions/catalog";
import type { Question } from "../questions/types";

const question: Question = Object.freeze({
  id: "general-001",
  category: "General",
  prompt: "Name something people do when they cannot sleep.",
  answers: Object.freeze([
    Object.freeze({ label: "Check their phone", aliases: Object.freeze(["scroll"]), share: 34, insight: "The glowing rectangle wins the midnight vote." }),
    Object.freeze({ label: "Read", aliases: Object.freeze(["read a book"]), share: 19, insight: "A familiar route back toward sleep." }),
    Object.freeze({ label: "Count backwards", aliases: Object.freeze(["count sheep"]), share: 14, insight: "The classic answer still travels in a school." }),
    Object.freeze({ label: "Make tea", aliases: Object.freeze(["tea"]), share: 10, insight: "A warm cup joins the night shift." }),
    Object.freeze({ label: "Walk around", aliases: Object.freeze(["walk"]), share: 8, insight: "Some sleepers reset by moving." }),
    Object.freeze({ label: "Rearrange the room", aliases: Object.freeze(["move furniture"]), share: 6, insight: "Restlessness becomes interior design." }),
    Object.freeze({ label: "Listen to train sounds", aliases: Object.freeze(["train noises"]), share: 7.5, insight: "A side channel of the night shift." }),
    Object.freeze({ label: "Watch the ceiling", aliases: Object.freeze(["stare at the ceiling"]), share: 1.5, insight: "A tiny crowd studies the dark." }),
  ]),
});

describe("crowd-rarity scoring", () => {
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

  it("scores an alias from its share and returns common comparisons", () => {
    const result = evaluateSubmission(question, "  TRAIN noises! ");

    expect(result).toMatchObject({
      recognized: true,
      normalizedAnswer: "trainnoises",
      answerLabel: "Listen to train sounds",
      crowdShare: 7.5,
      tier: "rare",
      score: 60,
      depthMetres: 600,
      quip: "A side channel of the night shift.",
    });
    expect(result.commonAnswers.slice(0, 2)).toEqual([
      { label: "Check their phone", share: 34 },
      { label: "Read", share: 19 },
    ]);
  });

  it("treats unlisted text as uncharted instead of rewarding nonsense", () => {
    expect(evaluateSubmission(question, "purple quantum walrus")).toMatchObject({
      recognized: false,
      answerLabel: "purple quantum walrus",
      crowdShare: null,
      tier: "uncharted",
      score: 0,
      depthMetres: 0,
    });
  });

  it("does not mutate the prompt atlas", () => {
    const before = JSON.stringify(question);
    evaluateSubmission(question, "phone");
    expect(JSON.stringify(question)).toBe(before);
  });

  it.each(["rocket", "a rocket", "the rocket", "rockets", "launch vehicle"])(
    "recognizes the bounded rocket surface %s",
    (answer) => {
      const rocketQuestion = findQuestionById("history-014");
      expect(rocketQuestion).toBeDefined();

      expect(evaluateSubmission(rocketQuestion!, answer)).toMatchObject({
        recognized: true,
        answerLabel: "A rocket",
        crowdShare: expect.any(Number),
        tier: expect.not.stringMatching("uncharted"),
        score: expect.any(Number),
      });
    },
  );

  it("keeps bare rock uncharted for the rocket prompt", () => {
    const rocketQuestion = findQuestionById("history-014");
    expect(rocketQuestion).toBeDefined();

    expect(evaluateSubmission(rocketQuestion!, "rock")).toMatchObject({
      recognized: false,
      tier: "uncharted",
      score: 0,
      depthMetres: 0,
    });
  });
});
