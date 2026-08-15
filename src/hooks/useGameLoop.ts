"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { CATEGORIES, type Category, type PublicQuestion } from "../lib/questions/types";
import { getUtcDateKey, isIsoDate } from "../lib/questions/date";
import {
  ARCADE_QUESTION_COUNT,
  DAILY_QUESTION_COUNT,
} from "../lib/questions/selection";
import { useAppState } from "../state/AppStateProvider";
import { useSoundFx } from "./useSoundFx";
import {
  ANSWER_SECONDS,
  PREVIEW_SECONDS,
  createInitialGameState,
  gameReducer,
  type GameMode,
} from "../components/game/gameReducer";
import {
  DEFAULT_STATS,
  readProgress,
  readStats,
  isSubmissionResult,
  writeProgress,
  writeStats,
  type DiveStats,
} from "../components/game/storage";

type ApiEnvelope<T> = Readonly<{
  success: boolean;
  data: T | null;
  error: string | null;
}>;

export const SUBMISSION_TIMEOUT_MS = 8_000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPublicQuestion = (value: unknown): value is PublicQuestion => {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.prompt !== "string") {
    return false;
  }
  if (
    typeof value.category !== "string" ||
    !(CATEGORIES as readonly string[]).includes(value.category)
  ) {
    return false;
  }
  return Object.keys(value).sort().join(",") === "category,id,prompt";
};

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

const isAbortError = (error: unknown): boolean =>
  isRecord(error) && error.name === "AbortError";

const fetchWithDeadline = async (
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<Response> => {
  const controller = new AbortController();
  const deadline = window.setTimeout(() => controller.abort(), SUBMISSION_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(deadline);
  }
};

const getApiData = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success || payload.data === null) {
    throw new Error(payload.error ?? "The dive signal was interrupted.");
  }
  return payload.data;
};

export const useGameLoop = (mode: GameMode, category?: Category) => {
  const [state, dispatch] = useReducer(gameReducer, mode, createInitialGameState);
  const [hydrated, setHydrated] = useState(false);
  const [stats, setStats] = useState<DiveStats>(DEFAULT_STATS);
  const [dayLabel, setDayLabel] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const unlimitedRunRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  const statsRef = useRef(stats);
  const expireQuestionRef = useRef<() => void>(() => undefined);
  const answerDeadlineRef = useRef<number | null>(null);
  const answerTimerRef = useRef<number | null>(null);
  const answerIntervalRef = useRef<number | null>(null);
  const syncAnswerClockRef = useRef<() => void>(() => undefined);
  const expirationStartedRef = useRef(false);
  const [remainingMilliseconds, setRemainingMilliseconds] = useState(0);
  const { theme, toggleTheme } = useAppState();
  const { muted, toggleMute, play, sfx } = useSoundFx();
  const sfxRef = useRef(sfx);

  useEffect(() => {
    mountedRef.current = true;
    const dailyDate = mode === "daily" ? getUtcDateKey() : undefined;
    const progress = readProgress(mode, dailyDate);
    if (progress) dispatch({ type: "RESTORE_PROGRESS", progress });
    let hydrationCancelled = false;
    queueMicrotask(() => {
      if (hydrationCancelled || !mountedRef.current) return;
      setStats(readStats());
      setHydrated(true);
    });

    return () => {
      mountedRef.current = false;
      hydrationCancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    const persistablePhase =
      state.phase === "preview" ||
      state.phase === "answering" ||
      state.phase === "feedback" ||
      state.phase === "summary";
    if (!hydrated || !persistablePhase) return;
    writeProgress(state);
  }, [hydrated, state]);

  const startDive = useCallback(async () => {
    if (
      state.phase !== "intro" &&
      state.phase !== "summary" &&
      state.phase !== "error"
    ) {
      return;
    }

    dispatch({ type: "LOAD_START" });
    try {
      const query = new URLSearchParams({
        limit: String(mode === "unlimited" ? ARCADE_QUESTION_COUNT : DAILY_QUESTION_COUNT),
        mode,
      });
      const requestedDailyDate = mode === "daily" ? getUtcDateKey() : null;
      if (requestedDailyDate) query.set("date", requestedDailyDate);
      if (mode === "unlimited") {
        const run = unlimitedRunRef.current ?? Math.max(1, readStats().runs + 1);
        unlimitedRunRef.current = run;
        query.set("run", String(run));
        if (category) query.set("category", category);
      }
      const response = await fetch(`/api/questions?${query.toString()}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const questions = await getApiData<unknown>(response);
      if (!Array.isArray(questions) || !questions.every(isPublicQuestion)) {
        throw new Error("The question signal returned an unreadable payload.");
      }
      if (!mountedRef.current) return;
      const serverDayLabel =
        typeof response.headers?.get === "function"
          ? response.headers.get("x-omniquiz-day")
          : null;
      if (serverDayLabel && /^\d{3}$/.test(serverDayLabel)) {
        setDayLabel(serverDayLabel);
      }
      const serverDate =
        typeof response.headers?.get === "function"
          ? response.headers.get("x-omniquiz-date")
          : null;
      dispatch({
        type: "LOAD_QUESTIONS",
        questions,
        dailyDate: mode === "daily"
          ? serverDate && isIsoDate(serverDate)
            ? serverDate
            : requestedDailyDate
          : null,
      });
      sfx.start();
    } catch (error) {
      if (!mountedRef.current) return;
      dispatch({
        type: "LOAD_FAILED",
        error: errorMessage(error, "The dive signal is quiet. Try again."),
      });
    }
  }, [category, mode, sfx, state.phase]);

  const finalizeRun = useCallback(
    (finalScore: number, statsForRun: DiveStats = stats) => {
      const nextStats = Object.freeze({
        ...statsForRun,
        runs: statsForRun.runs + 1,
        bestScore: Math.max(statsForRun.bestScore, finalScore),
        lastScore: finalScore,
      });
      setStats(nextStats);
      writeStats(nextStats);
      if (mode === "unlimited") {
        const currentRun = unlimitedRunRef.current ?? nextStats.runs;
        unlimitedRunRef.current = Math.max(currentRun + 1, nextStats.runs + 1);
      }
    },
    [mode, stats],
  );

  const expireQuestion = useCallback(() => {
    const latestState = stateRef.current;
    if (latestState.phase !== "answering" || expirationStartedRef.current) return;

    expirationStartedRef.current = true;
    answerDeadlineRef.current = null;
    setRemainingMilliseconds(0);

    dispatch({ type: "TIME_EXPIRED" });
    const statsForRun = statsRef.current;
    const nextStats = Object.freeze({
      ...statsForRun,
      rounds: statsForRun.rounds + 1,
    });
    statsRef.current = nextStats;
    sfxRef.current.uncharted();
    setStats(nextStats);
  }, []);

  useEffect(() => {
    stateRef.current = state;
    statsRef.current = stats;
    sfxRef.current = sfx;
    expireQuestionRef.current = expireQuestion;
  }, [expireQuestion, sfx, state, stats]);

  useEffect(() => {
    if (state.phase !== "preview") return undefined;

    const timer = window.setInterval(() => {
      if (stateRef.current.phase === "preview") dispatch({ type: "PREVIEW_TICK" });
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "answering" && state.phase !== "submitting") {
      if (answerTimerRef.current !== null) {
        window.clearTimeout(answerTimerRef.current);
        answerTimerRef.current = null;
      }
      if (answerIntervalRef.current !== null) {
        window.clearInterval(answerIntervalRef.current);
        answerIntervalRef.current = null;
      }
      answerDeadlineRef.current = null;
      expirationStartedRef.current = false;
      return undefined;
    }

    const now = Date.now();
    let deadline = answerDeadlineRef.current;
    if (deadline === null) {
      deadline = now + Math.max(0, stateRef.current.remainingSeconds) * 1_000;
      answerDeadlineRef.current = deadline;
      expirationStartedRef.current = false;
    }

    const syncAnswerClock = () => {
      const latestState = stateRef.current;
      if (latestState.phase !== "answering" && latestState.phase !== "submitting") return;

      const nextRemainingMilliseconds = Math.max(0, deadline! - Date.now());
      setRemainingMilliseconds(nextRemainingMilliseconds);
      if (nextRemainingMilliseconds <= 0) {
        answerTimerRef.current = null;
        if (latestState.phase === "answering") {
          expireQuestionRef.current();
        } else if (latestState.remainingSeconds !== 0) {
          dispatch({ type: "SYNC_REMAINING", remainingSeconds: 0 });
        }
        return;
      }

      const nextSeconds = Math.ceil(nextRemainingMilliseconds / 1_000);
      if (nextSeconds !== latestState.remainingSeconds) {
        dispatch({ type: "SYNC_REMAINING", remainingSeconds: nextSeconds });
      }
    };

    syncAnswerClockRef.current = syncAnswerClock;
    syncAnswerClock();
    answerIntervalRef.current = window.setInterval(syncAnswerClock, 100);
    answerTimerRef.current = window.setTimeout(
      syncAnswerClock,
      Math.max(0, deadline - Date.now()),
    );
    const resyncOnResume = () => syncAnswerClockRef.current();
    document.addEventListener("visibilitychange", resyncOnResume);
    window.addEventListener("pageshow", resyncOnResume);
    window.addEventListener("focus", resyncOnResume);

    return () => {
      if (answerTimerRef.current !== null) {
        window.clearTimeout(answerTimerRef.current);
        answerTimerRef.current = null;
      }
      if (answerIntervalRef.current !== null) {
        window.clearInterval(answerIntervalRef.current);
        answerIntervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", resyncOnResume);
      window.removeEventListener("pageshow", resyncOnResume);
      window.removeEventListener("focus", resyncOnResume);
    };
  }, [state.phase]);

  const submitAnswer = useCallback(async () => {
    const question = state.questions[state.questionIndex];
    if (state.phase !== "answering" || !question || !state.answer.trim()) return;
    if (answerDeadlineRef.current !== null && Date.now() >= answerDeadlineRef.current) {
      expireQuestionRef.current();
      return;
    }

    dispatch({ type: "SUBMIT_START" });
    sfx.submit();
    try {
      const response = await fetchWithDeadline("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ questionId: question.id, answer: state.answer }),
      });
      const result = await getApiData<unknown>(response);
      if (!isSubmissionResult(result)) {
        throw new Error("The answer signal returned an unreadable payload.");
      }
      if (!mountedRef.current) return;
      dispatch({ type: "SUBMIT_RESOLVED", result });
      const nextStats = Object.freeze({
        ...stats,
        rounds: stats.rounds + 1,
        recognized: stats.recognized + (result.recognized ? 1 : 0),
      });
      if (result.recognized) sfx.reveal();
      else sfx.uncharted();
      setStats(nextStats);
    } catch (error) {
      if (!mountedRef.current) return;
      dispatch({
        type: "SUBMIT_FAILED",
        error: isAbortError(error)
          ? "The answer signal timed out. Try again."
          : errorMessage(error, "The answer did not reach the log. Try again."),
      });
    }
  }, [
    sfx,
    state.answer,
    state.phase,
    state.questionIndex,
    state.questions,
    stats,
  ]);

  const passQuestion = useCallback(() => {
    if (state.phase !== "answering") return;
    if (answerDeadlineRef.current !== null && Date.now() >= answerDeadlineRef.current) {
      expireQuestionRef.current();
      return;
    }

    dispatch({ type: "PASS_QUESTION" });
    const nextStats = Object.freeze({
      ...stats,
      rounds: stats.rounds + 1,
    });
    sfx.uncharted();
    setStats(nextStats);
  }, [sfx, state.phase, stats]);

  const continueDive = useCallback(() => {
    const isFinalFeedback =
      state.phase === "feedback" && state.questionIndex === state.questions.length - 1;

    if (isFinalFeedback) {
      finalizeRun(state.score);
    }

    dispatch({ type: "NEXT_ROUND" });
  }, [finalizeRun, state.phase, state.questionIndex, state.questions.length, state.score]);

  const setAnswer = useCallback((answer: string) => {
    if (
      stateRef.current.phase === "answering" &&
      answerDeadlineRef.current !== null &&
      Date.now() >= answerDeadlineRef.current
    ) {
      expireQuestionRef.current();
      return;
    }
    dispatch({ type: "SET_ANSWER", answer });
  }, []);

  const resetDive = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    stats,
    hydrated,
    dayLabel,
    theme,
    muted,
    toggleMute,
    toggleTheme,
    play,
    sfx,
    startDive,
    submitAnswer,
    passQuestion,
    setAnswer,
    continueDive,
    resetDive,
    previewSeconds: PREVIEW_SECONDS,
    answerSeconds: ANSWER_SECONDS,
    remainingMilliseconds,
  };
};
