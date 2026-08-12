import { normalizeAnswer } from "../questions/normalize";
import {
  type Question,
  type RarityTier,
} from "../questions/types";

export { RARITY_RULES } from "../questions/types";

export type SubmissionResult = Readonly<{
  accepted: boolean;
  normalizedAnswer: string;
  tier: RarityTier;
  score: number;
  depth: number;
  quip: string;
}>;

const SUCCESS_QUIPS = Object.freeze({
  plankton: "A small catch, cleanly landed.",
  tooclever: "Nicely spotted.",
  schooler: "That one belongs in the notebook.",
  rare: "A sharp bit of recall.",
  deepcut: "Deep knowledge confirmed.",
  krillion: "Legendary answer.",
} satisfies Record<RarityTier, string>);

const FAILURE_QUIP = "Not this time; keep the curiosity alive.";

export const evaluateSubmission = (
  question: Question,
  answer: string,
): SubmissionResult => {
  const normalizedAnswer =
    typeof answer === "string" ? normalizeAnswer(answer) : "";
  const accepted =
    normalizedAnswer.length > 0 &&
    [question.canonicalAnswer, ...question.acceptedAliases].some(
      (candidate) => normalizeAnswer(candidate) === normalizedAnswer,
    );
  const { tier, score, depth } = question.rarity;

  return Object.freeze({
    accepted,
    normalizedAnswer,
    tier,
    score: accepted ? score : 0,
    depth,
    quip: accepted ? SUCCESS_QUIPS[tier] : FAILURE_QUIP,
  });
};
