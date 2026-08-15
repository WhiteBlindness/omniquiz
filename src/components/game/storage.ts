import type { PublicQuestion } from "../../lib/questions/types";
import { CATEGORIES, RARITY_TIERS } from "../../lib/questions/types";
import { getUtcDateKey, isIsoDate } from "../../lib/questions/date";
import type { SubmissionResult } from "../../lib/game/scoring";
import type { GameMode, GameOutcome, GamePhase, GameState, RoundLog } from "./gameReducer";

export const PROGRESS_STORAGE_KEY = "omniquiz-progress-v3";
export const PREFERENCES_STORAGE_KEY = "omniquiz-preferences-v1";
export const THEME_STORAGE_KEY = "omniquiz-theme-v1";
export const STATS_STORAGE_KEY = "omniquiz-stats-v2";

type PersistedPhase = Exclude<GamePhase, "loading" | "error">;

export type PersistedProgress = Readonly<{
  version: 3;
  mode: GameMode;
  dailyDate: string | null;
  phase: PersistedPhase;
  questions?: readonly PublicQuestion[];
  questionIndex: number;
  score: number;
  depthMetres: number;
  answer: string;
  remainingSeconds: number;
  previewSeconds: number;
  lastResult: SubmissionResult | null;
  lastOutcome?: GameOutcome | null;
  roundLog: readonly RoundLog[];
  savedAt: number;
}>;

export type DiveStats = Readonly<{
  runs: number;
  rounds: number;
  recognized: number;
  bestScore: number;
  lastScore: number;
}>;

export const DEFAULT_STATS: DiveStats = Object.freeze({
  runs: 0,
  rounds: 0,
  recognized: 0,
  bestScore: 0,
  lastScore: 0,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isMode = (value: unknown): value is GameMode =>
  value === "daily" || value === "unlimited";

const isDailyDate = (value: unknown, mode: GameMode): value is string | null =>
  mode === "daily"
    ? typeof value === "string" && isIsoDate(value)
    : value === null;

const isPhase = (value: unknown): value is PersistedPhase =>
  value === "intro" ||
  value === "preview" ||
  value === "answering" ||
  value === "submitting" ||
  value === "feedback" ||
  value === "summary";

const isOutcome = (value: unknown): value is GameOutcome =>
  value === "answer" || value === "pass" || value === "timeout";

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPublicQuestion = (value: unknown): value is PublicQuestion =>
  isRecord(value) &&
  typeof value.id === "string" &&
  value.id.length > 0 &&
  typeof value.prompt === "string" &&
  value.prompt.length > 0 &&
  typeof value.category === "string" &&
  (CATEGORIES as readonly string[]).includes(value.category) &&
  Object.keys(value).sort().join(",") === "category,id,prompt";

const isCommonAnswer = (value: unknown): value is SubmissionResult["commonAnswers"][number] =>
  isRecord(value) && typeof value.label === "string" && isNumber(value.share);

export const isSubmissionResult = (value: unknown): value is SubmissionResult =>
  isRecord(value) &&
  typeof value.recognized === "boolean" &&
  typeof value.normalizedAnswer === "string" &&
  typeof value.answerLabel === "string" &&
  (value.crowdShare === null || isNumber(value.crowdShare)) &&
  typeof value.tier === "string" &&
  (RARITY_TIERS as readonly string[]).includes(value.tier) &&
  isNumber(value.score) &&
  isNumber(value.depthMetres) &&
  typeof value.quip === "string" &&
  Array.isArray(value.commonAnswers) &&
  value.commonAnswers.every(isCommonAnswer);

const freezeSubmissionResult = (result: SubmissionResult): SubmissionResult =>
  Object.freeze({
    ...result,
    commonAnswers: Object.freeze(
      result.commonAnswers.map((answer) => Object.freeze({ ...answer })),
    ),
  });

const isRoundLog = (value: unknown): value is RoundLog =>
  isRecord(value) &&
  typeof value.questionId === "string" &&
  typeof value.prompt === "string" &&
  isOutcome(value.outcome) &&
  typeof value.submittedAnswer === "string" &&
  typeof value.answerLabel === "string" &&
  (value.crowdShare === null || isNumber(value.crowdShare)) &&
  typeof value.tier === "string" &&
  (RARITY_TIERS as readonly string[]).includes(value.tier) &&
  isNumber(value.score) &&
  isNumber(value.depthMetres) &&
  Array.isArray(value.commonAnswers) &&
  value.commonAnswers.every(isCommonAnswer);

const freezeRoundLog = (entry: RoundLog): RoundLog =>
  Object.freeze({
    ...entry,
    commonAnswers: Object.freeze(
      entry.commonAnswers.map((answer) => Object.freeze({ ...answer })),
    ),
  });

const parseProgress = (value: unknown): PersistedProgress | null => {
  if (!isRecord(value) || value.version !== 3 || !isMode(value.mode)) return null;
  if (!isDailyDate(value.dailyDate, value.mode)) return null;
  if (!isPhase(value.phase)) return null;
  if (
    !isNumber(value.questionIndex) ||
    !isNumber(value.score) ||
    !isNumber(value.depthMetres) ||
    typeof value.answer !== "string" ||
    !isNumber(value.remainingSeconds) ||
    !isNumber(value.previewSeconds) ||
    !isNumber(value.savedAt) ||
    !Array.isArray(value.roundLog) ||
    !value.roundLog.every(isRoundLog)
  ) {
    return null;
  }

  let lastResult: SubmissionResult | null = null;
  if (value.lastResult !== null && value.lastResult !== undefined) {
    if (!isSubmissionResult(value.lastResult)) return null;
    lastResult = freezeSubmissionResult(value.lastResult);
  }
  if (value.phase === "feedback" && !lastResult) return null;

  let questions: readonly PublicQuestion[] | undefined;
  if (value.questions !== undefined) {
    if (!Array.isArray(value.questions) || !value.questions.every(isPublicQuestion)) return null;
    questions = Object.freeze(value.questions.map((question) => Object.freeze({ ...question })));
  }

  let lastOutcome: GameOutcome | null = null;
  if (value.lastOutcome !== null && value.lastOutcome !== undefined) {
    if (!isOutcome(value.lastOutcome)) return null;
    lastOutcome = value.lastOutcome;
  }

  return Object.freeze({
    version: 3,
    mode: value.mode,
    dailyDate: value.dailyDate,
    phase: value.phase,
    questions,
    questionIndex: value.questionIndex,
    score: value.score,
    depthMetres: value.depthMetres,
    answer: value.answer,
    remainingSeconds: value.remainingSeconds,
    previewSeconds: value.previewSeconds,
    lastResult,
    lastOutcome: value.phase === "feedback" ? lastOutcome ?? "answer" : null,
    roundLog: Object.freeze(value.roundLog.map(freezeRoundLog)),
    savedAt: value.savedAt,
  });
};

export const recoverPersistedProgress = (
  progress: PersistedProgress,
  now = Date.now(),
): PersistedProgress => {
  const elapsed = Math.max(0, now - progress.savedAt);
  if (progress.phase === "submitting") {
    return Object.freeze({ ...progress, phase: "answering", savedAt: now });
  }
  if (progress.phase === "answering") {
    const remainingMilliseconds = progress.remainingSeconds * 1_000 - elapsed;
    if (remainingMilliseconds <= 0) {
      return Object.freeze({ ...progress, remainingSeconds: 0, savedAt: now });
    }
    return Object.freeze({
      ...progress,
      remainingSeconds: Math.ceil(remainingMilliseconds / 1_000),
      savedAt: now,
    });
  }
  if (progress.phase === "preview") {
    const previewMilliseconds = progress.previewSeconds * 1_000 - elapsed;
    if (previewMilliseconds <= 0) {
      return Object.freeze({
        ...progress,
        phase: "answering",
        previewSeconds: 0,
        remainingSeconds: Math.max(1, progress.remainingSeconds),
        savedAt: now,
      });
    }
    return Object.freeze({
      ...progress,
      previewSeconds: Math.max(1, Math.ceil(previewMilliseconds / 1_000)),
      savedAt: now,
    });
  }
  return Object.freeze({ ...progress, savedAt: now });
};

export const toPersistedProgress = (state: GameState, now = Date.now()): PersistedProgress =>
  Object.freeze({
    version: 3,
    mode: state.mode,
    dailyDate: state.mode === "daily"
      ? state.dailyDate ?? getUtcDateKey(now)
      : null,
    phase: state.phase === "loading" || state.phase === "error" ? "intro" : state.phase,
    questions: Object.freeze(state.questions.map((question) => Object.freeze({ ...question }))),
    questionIndex: state.questionIndex,
    score: state.score,
    depthMetres: state.depthMetres,
    answer: state.answer,
    remainingSeconds: state.remainingSeconds,
    previewSeconds: state.previewSeconds,
    lastResult: state.lastResult ? freezeSubmissionResult(state.lastResult) : null,
    lastOutcome: state.lastOutcome,
    roundLog: Object.freeze(state.roundLog.map(freezeRoundLog)),
    savedAt: now,
  });

export const readProgress = (
  mode: GameMode,
  dailyDate = getUtcDateKey(),
): PersistedProgress | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    const parsed = parseProgress(raw ? JSON.parse(raw) : null);
    if (parsed?.mode !== mode) return null;
    if (mode === "daily" && parsed.dailyDate !== dailyDate) return null;
    return recoverPersistedProgress(parsed);
  } catch {
    return null;
  }
};

export const writeProgress = (state: GameState): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(toPersistedProgress(state)));
  } catch {
    // Local persistence is an enhancement; a private browsing quota must not stop a dive.
  }
};

export const readMutePreference = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isRecord(parsed) && typeof parsed.muted === "boolean" ? parsed.muted : false;
  } catch {
    return false;
  }
};

export const writeMutePreference = (muted: boolean): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ muted }));
  } catch {
    // Audio preference is optional state.
  }
};

export const readThemePreference = (): ThemePreference => {
  if (typeof window === "undefined") return "dark";
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

export type ThemePreference = "dark" | "light";

export const writeThemePreference = (theme: ThemePreference): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // Theme is optional state.
  }
};

export const readStats = (): DiveStats => {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = window.localStorage.getItem(STATS_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!isRecord(parsed)) return DEFAULT_STATS;
    return Object.freeze({
      runs: isNumber(parsed.runs) ? Math.max(0, parsed.runs) : 0,
      rounds: isNumber(parsed.rounds) ? Math.max(0, parsed.rounds) : 0,
      recognized: isNumber(parsed.recognized) ? Math.max(0, parsed.recognized) : 0,
      bestScore: isNumber(parsed.bestScore) ? Math.max(0, parsed.bestScore) : 0,
      lastScore: isNumber(parsed.lastScore) ? Math.max(0, parsed.lastScore) : 0,
    });
  } catch {
    return DEFAULT_STATS;
  }
};

export const writeStats = (stats: DiveStats): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Stats are best effort and never block gameplay.
  }
};
