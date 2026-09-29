import { questionsForPack } from "../../../lib/questions/catalog";
import { toPublicQuestions } from "../../../lib/questions/public";
import { isLivePackId, packSupportsMode, type PackId } from "../../../lib/packs/meta";
import {
  QUESTIONS_PER_MODE,
  selectDailyQuestions,
} from "../../../lib/questions/selection";
import {
  getUtcDateKey,
  getUtcDayOfYear,
  isIsoDate,
  offsetIsoDate,
} from "../../../lib/questions/date";
import { CATEGORIES, type Category } from "../../../lib/questions/types";
import type { GameMode } from "../../../components/game/gameReducer";

const MAX_UNLIMITED_RUN = 10_000;
const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

export const dynamic = "force-dynamic";

type ApiEnvelope<T> = Readonly<{
  success: boolean;
  data: T | null;
  error: string | null;
}>;

const response = <T>(
  body: ApiEnvelope<T>,
  status: number,
  headers?: HeadersInit,
) => Response.json(body, {
  status,
  headers: { ...NO_STORE_HEADERS, ...headers },
});

const failure = (message: string, status = 400) =>
  response({ success: false, data: null, error: message }, status);

const isCategory = (value: string): value is Category =>
  (CATEGORIES as readonly string[]).includes(value);

const isMode = (value: string): value is GameMode =>
  value === "daily" || value === "unlimited" || value === "speed" || value === "survival";

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
  const packValue = getSingleQueryValue(url, "pack");
  const runValue = getSingleQueryValue(url, "run");
  const dateValue = getSingleQueryValue(url, "date");

  if (
    categoryValue === undefined ||
    limitValue === undefined ||
    modeValue === undefined ||
    packValue === undefined ||
    runValue === undefined ||
    dateValue === undefined ||
    (categoryValue !== null && !isCategory(categoryValue)) ||
    (modeValue !== null && !isMode(modeValue)) ||
    (dateValue !== null && !isIsoDate(dateValue))
  ) {
    return failure("category, mode, and date must be supported values");
  }
  if (packValue !== null && !isLivePackId(packValue)) {
    return failure("pack must be a live content pack");
  }

  const pack: PackId = packValue ?? "core";
  const mode: GameMode = modeValue ?? "daily";
  if (!packSupportsMode(pack, mode)) {
    return failure(`mode ${mode} is not available for the ${pack} pack`);
  }
  if (categoryValue !== null && pack !== "core") {
    return failure("category filtering is only available for the core pack");
  }
  const defaultLimit = QUESTIONS_PER_MODE[mode];
  const maximumLimit = QUESTIONS_PER_MODE[mode];
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

  const packQuestions = questionsForPack(pack);
  const candidates = categoryValue
    ? packQuestions.filter((question) => question.category === categoryValue)
    : packQuestions;
  const today = getUtcDateKey();
  const date = mode === "daily"
    ? dateValue ?? today
    : offsetIsoDate(today, run - 1);
  const questions = selectDailyQuestions(candidates, date, limit);
  const dayLabel = String(getUtcDayOfYear(date)).padStart(3, "0");

  return response(
    { success: true, data: toPublicQuestions(questions), error: null },
    200,
    {
      "X-Omniquiz-Day": dayLabel,
      "X-Omniquiz-Date": date,
    },
  );
}

export { getUtcDateKey, getUtcDayOfYear, isIsoDate, offsetIsoDate } from "../../../lib/questions/date";
