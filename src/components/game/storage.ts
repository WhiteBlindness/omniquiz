import type { PublicQuestion } from "../../lib/questions/types";
import { RARITY_TIERS } from "../../lib/questions/types";
import type { SubmissionResult } from "../../lib/game/scoring";
import type { GameMode, GamePhase, GameState } from "./gameReducer";

export const PROGRESS_STORAGE_KEY = "omniquiz-progress-v1";
export const PREFERENCES_STORAGE_KEY = "omniquiz-preferences-v1";
export const STATS_STORAGE_KEY = "omniquiz-stats-v1";

type PersistedPhase = Exclude<GamePhase, "loading" | "error">;

export type PersistedProgress = Readonly<{
  version: 1;
  mode: GameMode;
  phase: PersistedPhase;
  questions?: readonly PublicQuestion[];
  questionIndex: number;
  score: number;
  depthMetres: number;
  answer: string;
  remainingSeconds: number;
  previewSeconds: number;
  lastResult: SubmissionResult | null;
  savedAt: number;
}>;

export type DiveStats = Readonly<{
  runs: number;
  answers: number;
  correct: number;
  bestScore: number;
  lastScore: number;
}>;

export const DEFAULT_STATS: DiveStats = Object.freeze({
  runs: 0,
  answers: 0,
  correct: 0,
  bestScore: 0,
  lastScore: 0,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isMode = (value: unknown): value is GameMode =>
  value === "daily" || value === "unlimited";

const isPhase = (value: unknown): value is PersistedPhase =>
  value === "intro" ||
  value === "preview" ||
  value === "answering" ||
  value === "submitting" ||
  value === "feedback" ||
  value === "summary";

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const isSubmissionResult = (value: unknown): value is SubmissionResult =>
  isRecord(value) &&
  typeof value.accepted === "boolean" &&
  typeof value.normalizedAnswer === "string" &&
  typeof value.tier === "string" &&
  (RARITY_TIERS as readonly string[]).includes(value.tier) &&
  isNumber(value.score) &&
  isNumber(value.depth) &&
  typeof value.quip === "string";

const freezeSubmissionResult = (result: SubmissionResult): SubmissionResult =>
  Object.freeze({ ...result });

const parseProgress = (value: unknown): PersistedProgress | null => {
  if (!isRecord(value) || value.version !== 1 || !isMode(value.mode)) return null;
  if (!isPhase(value.phase)) return null;
  if (
    !isNumber(value.questionIndex) ||
    !isNumber(value.score) ||
    !isNumber(value.depthMetres) ||
    typeof value.answer !== "string" ||
    !isNumber(value.remainingSeconds) ||
    !isNumber(value.previewSeconds) ||
    !isNumber(value.savedAt)
  ) {
    return null;
  }

  let lastResult: SubmissionResult | null = null;
  if ("lastResult" in value && value.lastResult !== null && value.lastResult !== undefined) {
    if (!isSubmissionResult(value.lastResult)) return null;
    lastResult = freezeSubmissionResult(value.lastResult);
  }
  if (value.phase === "feedback" && !lastResult) return null;

  return Object.freeze({
    version: 1,
    mode: value.mode,
    phase: value.phase,
    questions: Array.isArray(value.questions)
      ? Object.freeze(value.questions as readonly PublicQuestion[])
      : undefined,
    questionIndex: value.questionIndex,
    score: value.score,
    depthMetres: value.depthMetres,
    answer: value.answer,
    remainingSeconds: value.remainingSeconds,
    previewSeconds: value.previewSeconds,
    lastResult,
    savedAt: value.savedAt,
  });
};

export const recoverPersistedProgress = (
  progress: PersistedProgress,
  now = Date.now(),
): PersistedProgress => {
  const elapsed = Math.max(0, now - progress.savedAt);
  if (progress.phase === "feedback" && !progress.lastResult) {
    return Object.freeze({
      ...progress,
      phase: "intro",
      answer: "",
      remainingSeconds: 0,
      previewSeconds: 0,
      lastResult: null,
      savedAt: now,
    });
  }
  if (progress.phase === "submitting") {
    return Object.freeze({ ...progress, phase: "answering", savedAt: now });
  }
  if (progress.phase === "answering" && elapsed >= progress.remainingSeconds * 1_000) {
    return Object.freeze({
      ...progress,
      phase: "answering",
      remainingSeconds: 1,
      savedAt: now,
    });
  }
  if (progress.phase === "preview" && elapsed >= progress.previewSeconds * 1_000) {
    return Object.freeze({
      ...progress,
      phase: "answering",
      previewSeconds: 0,
      remainingSeconds: Math.max(1, progress.remainingSeconds),
      savedAt: now,
    });
  }
  return Object.freeze({ ...progress, savedAt: now });
};

export const toPersistedProgress = (
  state: GameState,
  now = Date.now(),
): PersistedProgress =>
  Object.freeze({
    version: 1,
    mode: state.mode,
    phase: state.phase === "loading" || state.phase === "error" ? "intro" : state.phase,
    questions: Object.freeze([...state.questions]),
    questionIndex: state.questionIndex,
    score: state.score,
    depthMetres: state.depthMetres,
    answer: state.answer,
    remainingSeconds: state.remainingSeconds,
    previewSeconds: state.previewSeconds,
    lastResult: state.lastResult
      ? freezeSubmissionResult(state.lastResult)
      : null,
    savedAt: now,
  });

export const readProgress = (mode: GameMode): PersistedProgress | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    const parsed = parseProgress(raw ? JSON.parse(raw) : null);
    return parsed?.mode === mode ? recoverPersistedProgress(parsed) : null;
  } catch {
    return null;
  }
};

export const writeProgress = (state: GameState): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify(toPersistedProgress(state)),
    );
  } catch {
    // Storage is an enhancement; a private browsing quota must not stop a dive.
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
    // See writeProgress: audio preference is optional state.
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
      answers: isNumber(parsed.answers) ? Math.max(0, parsed.answers) : 0,
      correct: isNumber(parsed.correct) ? Math.max(0, parsed.correct) : 0,
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
