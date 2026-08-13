export const DAILY_SCORE_CEILING = 700;

export const getEstimatedDailyPercentile = (score: number): number => {
  const safeScore = Number.isFinite(score) ? score : 0;
  const boundedScore = Math.min(DAILY_SCORE_CEILING, Math.max(0, safeScore));
  return Math.round((boundedScore / DAILY_SCORE_CEILING) * 98) + 1;
};
