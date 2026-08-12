"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import type { Category, PublicQuestion } from "../lib/questions/types";
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPublicQuestion = (value: unknown): value is PublicQuestion => {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.prompt !== "string") {
    return false;
  }
  if (typeof value.category !== "string" || typeof value.difficulty !== "string") return false;
  if (!isRecord(value.rarity)) return false;
  return (
    typeof value.rarity.tier === "string" &&
    typeof value.rarity.score === "number" &&
    typeof value.rarity.depth === "number"
  );
};

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

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
  const { muted, toggleMute, play } = useSoundFx();

  useEffect(() => {
    mountedRef.current = true;
    const progress = readProgress(mode);
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
    if (state.phase !== "preview" && state.phase !== "answering") return undefined;

    const timer = window.setInterval(() => {
      dispatch({ type: state.phase === "preview" ? "PREVIEW_TICK" : "ANSWER_TICK" });
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [state.phase]);

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
    if (state.phase !== "intro" && state.phase !== "summary" && state.phase !== "error") {
      return;
    }

    dispatch({ type: "LOAD_START" });
    try {
      const query = new URLSearchParams({ limit: "7", mode });
      if (mode === "unlimited") {
        const run = unlimitedRunRef.current ?? Math.max(1, readStats().runs + 1);
        unlimitedRunRef.current = run;
        query.set("run", String(run));
        if (category) query.set("category", category);
      }
      const response = await fetch(`/api/questions?${query.toString()}`, {
        headers: { Accept: "application/json" },
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
      dispatch({ type: "LOAD_QUESTIONS", questions });
      play("start");
    } catch (error) {
      if (!mountedRef.current) return;
      dispatch({
        type: "LOAD_FAILED",
        error: errorMessage(error, "The dive signal is quiet. Try again."),
      });
    }
  }, [category, mode, play, state.phase]);

  const submitAnswer = useCallback(async () => {
    const question = state.questions[state.questionIndex];
    if (state.phase !== "answering" || !question || !state.answer.trim()) return;

    dispatch({ type: "SUBMIT_START" });
    play("submit");
    try {
      const response = await fetch("/api/submit", {
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
      play(result.accepted ? "success" : "miss");
      setStats((current) => ({
        ...current,
        answers: current.answers + 1,
        correct: current.correct + (result.accepted ? 1 : 0),
      }));
    } catch (error) {
      if (!mountedRef.current) return;
      dispatch({
        type: "SUBMIT_FAILED",
        error: errorMessage(error, "The answer did not reach the log. Try again."),
      });
    }
  }, [play, state.answer, state.phase, state.questionIndex, state.questions]);

  const passQuestion = useCallback(() => {
    if (state.phase !== "answering") return;

    dispatch({ type: "PASS_QUESTION" });
    play("miss");
    setStats((current) => ({
      ...current,
      answers: current.answers + 1,
    }));
  }, [play, state.phase]);

  const continueDive = useCallback(() => {
    const isFinalFeedback =
      state.phase === "feedback" && state.questionIndex === state.questions.length - 1;

    if (isFinalFeedback) {
      const nextStats = Object.freeze({
        ...stats,
        runs: stats.runs + 1,
        bestScore: Math.max(stats.bestScore, state.score),
        lastScore: state.score,
      });
      setStats(nextStats);
      writeStats(nextStats);
      if (mode === "unlimited") {
        const currentRun = unlimitedRunRef.current ?? nextStats.runs;
        unlimitedRunRef.current = Math.max(currentRun + 1, nextStats.runs + 1);
      }
    }

    dispatch({ type: "NEXT_ROUND" });
  }, [mode, state.phase, state.questionIndex, state.questions.length, state.score, stats]);

  const setAnswer = useCallback((answer: string) => {
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
    muted,
    toggleMute,
    startDive,
    submitAnswer,
    passQuestion,
    setAnswer,
    continueDive,
    resetDive,
    previewSeconds: PREVIEW_SECONDS,
    answerSeconds: ANSWER_SECONDS,
  };
};
