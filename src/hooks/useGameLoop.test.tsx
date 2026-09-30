// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SubmissionResult } from "../lib/game/scoring";
import type { PublicQuestion } from "../lib/questions/types";
import {
  PREVIEW_SECONDS,
  answerSecondsForMode,
  type GameMode,
} from "../components/game/gameReducer";
import { STATS_STORAGE_KEY, readStats } from "../components/game/storage";
import { AppStateProvider } from "../state/AppStateProvider";
import { useGameLoop } from "./useGameLoop";

const questions: readonly PublicQuestion[] = Object.freeze(
  [1, 2, 3, 4].map((index) =>
    Object.freeze({
      id: `general-00${index}`,
      category: "General" as const,
      prompt: `Name a deep-sea signal ${index}.`,
    }),
  ),
);

const recognizedResult: SubmissionResult = Object.freeze({
  recognized: true,
  normalizedAnswer: "gulfstream",
  answerLabel: "Gulf Stream",
  crowdShare: 7.5,
  tier: "rare",
  score: 60,
  depthMetres: 600,
  quip: "A sharp current with a quieter route.",
  commonAnswers: Object.freeze([{ label: "Kuroshio", share: 21 }]),
});

const unchartedResult: SubmissionResult = Object.freeze({
  recognized: false,
  normalizedAnswer: "purplequantumwalrus",
  answerLabel: "purple quantum walrus",
  crowdShare: null,
  tier: "uncharted",
  score: 0,
  depthMetres: 0,
  quip: "That answer is outside this expedition's atlas.",
  commonAnswers: Object.freeze([{ label: "Kuroshio", share: 21 }]),
});

const SEEDED_STATS = Object.freeze({
  runs: 2,
  rounds: 5,
  recognized: 3,
  bestScore: 30,
  lastScore: 10,
});

let submissionResult: SubmissionResult = recognizedResult;

type Loop = { current: ReturnType<typeof useGameLoop> };
type LifeLoss = "answer" | "pass" | "timeout";

const mountLoop = async (mode: GameMode) => {
  const view = renderHook(() => useGameLoop(mode), { wrapper: AppStateProvider });
  // Let the stats and progress hydration microtasks settle before play.
  await act(async () => {
    await Promise.resolve();
  });
  return view;
};

const finishPreview = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(PREVIEW_SECONDS * 1_000);
  });
};

const startRun = async (loop: Loop) => {
  await act(async () => {
    await loop.current.startDive();
  });
  await finishPreview();
};

const answer = async (loop: Loop, result: SubmissionResult) => {
  submissionResult = result;
  act(() => loop.current.setAnswer(result.answerLabel));
  await act(async () => {
    await loop.current.submitAnswer();
  });
};

const loseLife = async (loop: Loop, how: LifeLoss) => {
  if (how === "answer") {
    await answer(loop, unchartedResult);
  } else if (how === "pass") {
    act(() => loop.current.passQuestion());
  } else {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(answerSecondsForMode("survival") * 1_000);
    });
  }
};

const nextRound = async (loop: Loop) => {
  act(() => loop.current.continueDive());
  if (loop.current.state.phase === "preview") await finishPreview();
};

const playFullRun = async (loop: Loop) => {
  await startRun(loop);
  for (let index = 0; index < questions.length; index += 1) {
    await answer(loop, recognizedResult);
    await nextRound(loop);
  }
};

const playSurvivalDeath = async (loop: Loop, how: LifeLoss) => {
  await startRun(loop);
  await answer(loop, recognizedResult);
  await nextRound(loop);
  await loseLife(loop, how);
  await nextRound(loop);
  await loseLife(loop, how);
  await nextRound(loop);
  await loseLife(loop, how);
};

describe("useGameLoop run statistics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(SEEDED_STATS));
    submissionResult = recognizedResult;
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) =>
        Promise.resolve({
          ok: true,
          headers: { get: () => null },
          json: async () => ({
            success: true,
            data: String(input).includes("/api/questions") ? questions : submissionResult,
            error: null,
          }),
        }),
      ),
    );
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each<LifeLoss>(["answer", "pass", "timeout"])(
    "logs a Survival run that loses its last life on %s exactly once",
    async (how) => {
      const { result, rerender } = await mountLoop("survival");

      await playSurvivalDeath(result, how);

      expect(result.current.state.phase).toBe("summary");
      expect(result.current.state.lives).toBe(0);
      expect(result.current.state.score).toBe(60);
      const expected = {
        runs: 3,
        rounds: 9,
        recognized: 4,
        bestScore: 60,
        lastScore: 60,
      };
      expect(result.current.stats).toEqual(expected);
      expect(readStats()).toEqual(expected);

      rerender();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(30_000);
      });
      expect(result.current.stats.runs).toBe(3);
      expect(readStats().runs).toBe(3);
    },
  );

  it.each<GameMode>(["daily", "unlimited", "speed", "survival"])(
    "logs each completed %s run exactly once",
    async (mode) => {
      const { result, rerender } = await mountLoop(mode);

      await playFullRun(result);

      expect(result.current.state.phase).toBe("summary");
      expect(result.current.stats.runs).toBe(3);
      expect(readStats()).toMatchObject({
        runs: 3,
        bestScore: result.current.state.score,
        lastScore: result.current.state.score,
      });

      rerender();
      expect(readStats().runs).toBe(3);

      await playFullRun(result);

      expect(result.current.state.phase).toBe("summary");
      expect(readStats().runs).toBe(4);
    },
  );

  it.each<[GameMode, (loop: Loop) => Promise<void>]>([
    ["daily", playFullRun],
    ["survival", (loop) => playSurvivalDeath(loop, "answer")],
  ])("does not log a %s run again when its summary is restored", async (mode, play) => {
    const first = await mountLoop(mode);
    await play(first.result);
    expect(readStats().runs).toBe(3);
    first.unmount();

    const { result } = await mountLoop(mode);

    expect(result.current.state.phase).toBe("summary");
    expect(result.current.stats.runs).toBe(3);
    expect(readStats().runs).toBe(3);
  });
});
