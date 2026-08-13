import { QUESTION_BANK } from "../../../lib/questions/catalog";
import { toPublicQuestions } from "../../../lib/questions/public";
import {
  ARCADE_QUESTION_COUNT,
  DAILY_QUESTION_COUNT,
  selectDailyQuestions,
} from "../../../lib/questions/selection";
import { CATEGORIES, type Category } from "../../../lib/questions/types";
import type { GameMode } from "../../../components/game/gameReducer";

const MAX_UNLIMITED_RUN = 10_000;

type ApiEnvelope<T> = Readonly<{
  success: boolean;
  data: T | null;
  error: string | null;
}>;

const response = <T>(
  body: ApiEnvelope<T>,
  status: number,
  headers?: HeadersInit,
) => Response.json(body, { status, headers });

const failure = (message: string, status = 400) =>
  response({ success: false, data: null, error: message }, status);

const isCategory = (value: string): value is Category =>
  (CATEGORIES as readonly string[]).includes(value);

const isMode = (value: string): value is GameMode =>
  value === "daily" || value === "unlimited";

const getSingleQueryValue = (url: URL, name: string): string | null | undefined => {
  const values = url.searchParams.getAll(name);
  if (values.length > 1) return undefined;
  return values[0] ?? null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryValue = getSingleQueryValue(url, "category");
  const limitValue = getSingleQueryValue(url, "limit");
  const modeValue = getSingleQueryValue(url, "mode");
  const runValue = getSingleQueryValue(url, "run");

  if (
    categoryValue === undefined ||
    limitValue === undefined ||
    modeValue === undefined ||
    runValue === undefined ||
    (categoryValue !== null && !isCategory(categoryValue)) ||
    (modeValue !== null && !isMode(modeValue))
  ) {
    return failure("category and mode must be supported values");
  }

  const mode: GameMode = modeValue ?? "daily";
  const defaultLimit = mode === "unlimited"
    ? ARCADE_QUESTION_COUNT
    : DAILY_QUESTION_COUNT;
  const maximumLimit = mode === "unlimited"
    ? ARCADE_QUESTION_COUNT
    : DAILY_QUESTION_COUNT;
  const limit =
    limitValue === null
      ? defaultLimit
      : /^\d{1,2}$/.test(limitValue)
        ? Number(limitValue)
        : NaN;
  if (!Number.isInteger(limit) || limit < 1 || limit > maximumLimit) {
    return failure(`limit must be an integer between 1 and ${maximumLimit}`);
  }

  const run =
    runValue === null
      ? 1
      : /^(?:[1-9]\d{0,3}|10000)$/.test(runValue)
        ? Number(runValue)
        : NaN;
  if (!Number.isInteger(run) || run < 1 || run > MAX_UNLIMITED_RUN) {
    return failure(`run must be an integer between 1 and ${MAX_UNLIMITED_RUN}`);
  }

  const candidates = categoryValue
    ? QUESTION_BANK.filter((question) => question.category === categoryValue)
    : QUESTION_BANK;
  const today = new Date().toISOString().slice(0, 10);
  const date = mode === "unlimited" ? offsetIsoDate(today, run - 1) : today;
  const questions = selectDailyQuestions(candidates, date, limit);
  const dayLabel = String(getUtcDayOfYear(date)).padStart(3, "0");

  return response(
    { success: true, data: toPublicQuestions(questions), error: null },
    200,
    { "X-Omniquiz-Day": dayLabel },
  );
}

export const getUtcDayOfYear = (isoDate: string): number => {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - yearStart) / 86_400_000);
};

const offsetIsoDate = (date: string, offsetDays: number): string => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + offsetDays);
  return parsed.toISOString().slice(0, 10);
};
