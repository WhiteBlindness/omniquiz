import { normalizeAnswer } from "../questions/normalize";
import type { Question, RarityTier } from "../questions/types";

export const METRES_PER_POINT = 10;

export type RarityResult = Readonly<{
  tier: Exclude<RarityTier, "uncharted">;
  score: number;
  depthMetres: number;
}>;

export type CommonAnswer = Readonly<{
  label: string;
  share: number;
}>;

export type SubmissionResult = Readonly<{
  recognized: boolean;
  normalizedAnswer: string;
  answerLabel: string;
  crowdShare: number | null;
  tier: RarityTier;
  score: number;
  depthMetres: number;
  quip: string;
  commonAnswers: readonly CommonAnswer[];
}>;

const UNCHARTED_QUIP = "That answer is outside this expedition's atlas.";

export const rarityForCrowdShare = (share: number): RarityResult => {
  if (!Number.isFinite(share) || share <= 0 || share > 100) {
    throw new RangeError("crowd share must be greater than 0 and at most 100");
  }

  const tier: RarityResult["tier"] =
    share >= 30
      ? "plankton"
      : share >= 18
        ? "tooclever"
        : share >= 10
          ? "schooler"
          : share >= 5
            ? "rare"
            : share >= 2
              ? "deepcut"
              : "krillion";
  const score = {
    plankton: 10,
    tooclever: 15,
    schooler: 30,
    rare: 60,
    deepcut: 85,
    krillion: 100,
  }[tier];

  return Object.freeze({ tier, score, depthMetres: score * METRES_PER_POINT });
};

const commonAnswersFor = (question: Question): readonly CommonAnswer[] =>
  Object.freeze(
    [...question.answers]
      .sort((left, right) => right.share - left.share || left.label.localeCompare(right.label))
      .slice(0, 3)
      .map(({ label, share }) => Object.freeze({ label, share })),
  );

export const evaluateSubmission = (
  question: Question,
  answer: string,
): SubmissionResult => {
  const submittedAnswer = typeof answer === "string" ? answer.trim() : "";
  const normalizedAnswer = normalizeAnswer(submittedAnswer);
  const matchedFamily = normalizedAnswer
    ? question.answers.find((family) =>
        [family.label, ...family.aliases].some(
          (candidate) => normalizeAnswer(candidate) === normalizedAnswer,
        ),
      )
    : undefined;

  if (!matchedFamily) {
    return Object.freeze({
      recognized: false,
      normalizedAnswer,
      answerLabel: submittedAnswer,
      crowdShare: null,
      tier: "uncharted",
      score: 0,
      depthMetres: 0,
      quip: UNCHARTED_QUIP,
      commonAnswers: commonAnswersFor(question),
    });
  }

  const rarity = rarityForCrowdShare(matchedFamily.share);
  return Object.freeze({
    recognized: true,
    normalizedAnswer,
    answerLabel: matchedFamily.label,
    crowdShare: matchedFamily.share,
    ...rarity,
    quip: matchedFamily.insight,
    commonAnswers: commonAnswersFor(question),
  });
};

export const createZeroScoreResult = (outcome: "pass" | "timeout"): SubmissionResult =>
  Object.freeze({
    recognized: false,
    normalizedAnswer: "",
    answerLabel: outcome === "pass" ? "PASS" : "TIMEOUT",
    crowdShare: null,
    tier: "uncharted",
    score: 0,
    depthMetres: 0,
    quip:
      outcome === "pass"
        ? "Pass logged. The expedition keeps moving."
        : "The current carried you past this prompt. Zero points, no penalty.",
    commonAnswers: Object.freeze([]),
  });
