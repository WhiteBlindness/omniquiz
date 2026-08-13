import type { Question } from "./types";

export const DAILY_QUESTION_COUNT = 7;
export const ARCADE_QUESTION_COUNT = 15;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isDateKey = (date: string): boolean => {
  if (!DATE_PATTERN.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
};

const hash = (value: string): number => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
};

export const selectDailyQuestions = (
  questions: readonly Question[],
  date: string,
  limit = DAILY_QUESTION_COUNT,
): readonly Question[] => {
  if (!Array.isArray(questions)) throw new TypeError("questions must be an array");
  if (!isDateKey(date)) throw new RangeError("date must be an ISO date");
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError("limit must be a positive integer");
  }

  const uniqueQuestions = Array.from(
    new Map(questions.map((question) => [question.id, question])).values(),
  );
  if (uniqueQuestions.length < limit) {
    throw new RangeError("not enough unique questions for the requested limit");
  }

  const ordered = [...uniqueQuestions].sort((left, right) => {
    const leftHash = hash(`${date}:${left.id}`);
    const rightHash = hash(`${date}:${right.id}`);
    return leftHash - rightHash || left.id.localeCompare(right.id);
  });

  return Object.freeze(ordered.slice(0, limit));
};
