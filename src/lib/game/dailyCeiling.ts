import { DAILY_QUESTION_COUNT } from "../questions/selection";
import { rarityForCrowdShare } from "./scoring";

export const DAILY_SCORE_CEILING = DAILY_QUESTION_COUNT * rarityForCrowdShare(1).score;

/** Whole-number share of the daily maximum. This is a ratio, not a ranking against other players. */
export const getDailyScoreShare = (score: number): number => {
  const safeScore = Number.isFinite(score) ? score : 0;
  const boundedScore = Math.min(DAILY_SCORE_CEILING, Math.max(0, safeScore));
  return Math.round((boundedScore / DAILY_SCORE_CEILING) * 100);
};
