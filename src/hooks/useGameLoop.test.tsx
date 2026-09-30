// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { GameMode } from "../components/game/gameReducer";
import { readStats } from "../components/game/storage";
import type { SubmissionResult } from "../lib/game/scoring";
import type { PublicQuestion } from "../lib/questions/types";
import { AppStateProvider } from "../state/AppStateProvider";
import { useGameLoop } from "./useGameLoop";

const questions: readonly PublicQuestion[] = Array.from({ length: 5 }, (_, index) =>
  Object.freeze({
    id: `general-00${index + 1}`,
    category: "General",
    prompt: `Name thing number ${index + 1}.`,
  }),
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
  commonAnswers: Object.freeze([{ label: "Read", share: 19 }]),
});

const missedResult: SubmissionResult = Object.freeze({
  recognized: false,
  normalizedAnswer: "walrus",
  answerLabel: "walrus",
  crowdShare: null,
  tier: "uncharted",
  score: 0,
  depthMetres: 0,
  quip: "That answer isn't in the atlas.",
  commonAnswers: Object.freeze([{ label: "Read", share: 19 }]),
});

let questionCount = questions.length;
let nextResults: SubmissionResult[] = [];

const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
  <AppStateProvider>{children}</AppStateProvider>
);

const mountLoop = async (mode: GameMode) => {
  const view = renderHook(() => useGameLoop(mode), { wrapper });
  // Stats hydrate from storage in a microtask after mount.
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
  return view;
};

type Loop = { current: ReturnType<typeof useGameLoop> };

const startRun = async (result: Loop) => {
  await act(async () => {
    await result.current.startDive();
  });
  act(() => result.current.skipPreview());
  expect(result.current.state.phase).toBe("answering");
};

const submit = async (result: Loop, outcome: SubmissionResult) => {
  nextResults.push(outcome);
  act(() => result.current.setAnswer("some answer"));
  await act(async () => {
    await result.current.submitAnswer();
  });
};

const advanceToNextPrompt = (result: Loop) => {
  act(() => result.current.continueDive());
  if (result.current.state.phase === "preview") act(() => result.current.skipPreview());
};

describe("useGameLoop run finalization", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    questionCount = questions.length;
    nextResults = [];
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        if (String(input).includes("/api/questions")) {
          return Promise.resolve({
            ok: true,
            headers: { get: () => null },
            json: async () => ({ success: true, data: questions.slice(0, questionCount), error: null }),
          });
        }
        const data = nextResults.shift() ?? missedResult;
        return Promise.resolve({ ok: true, json: async () => ({ success: true, data, error: null }) });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("finalizes a Survival run that ends by losing the last life, exactly once", async () => {
    const { result, rerender } = await mountLoop("survival");
    await startRun(result);

    await submit(result, recognizedResult);
    advanceToNextPrompt(result);
    for (let life = 3; life > 1; life -= 1) {
      await submit(result, missedResult);
      expect(result.current.state.phase).toBe("feedback");
      advanceToNextPrompt(result);
    }
    await submit(result, missedResult);

    // The final life goes straight to the summary; no feedback step, no continueDive.
    expect(result.current.state.phase).toBe("summary");
    expect(result.current.state.lives).toBe(0);
    expect(result.current.stats).toMatchObject({ runs: 1, bestScore: 60, lastScore: 60 });
    expect(readStats("core")).toMatchObject({ runs: 1, bestScore: 60, lastScore: 60, rounds: 4 });

    rerender();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });
    expect(readStats("core").runs).toBe(1);
  });

  it("finalizes a Survival run whose last life runs out on the clock", async () => {
    const { result } = await mountLoop("survival");
    await startRun(result);

    for (let life = 3; life > 0; life -= 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(16_000);
      });
      if (life > 1) {
        expect(result.current.state.phase).toBe("feedback");
        advanceToNextPrompt(result);
      }
    }

    expect(result.current.state.phase).toBe("summary");
    expect(readStats("core")).toMatchObject({ runs: 1, bestScore: 0, lastScore: 0 });
  });

  it("does not count a restored Survival summary as another run", async () => {
    const first = await mountLoop("survival");
    await startRun(first.result);
    act(() => first.result.current.passQuestion());
    advanceToNextPrompt(first.result);
    act(() => first.result.current.passQuestion());
    advanceToNextPrompt(first.result);
    act(() => first.result.current.passQuestion());
    expect(first.result.current.state.phase).toBe("summary");
    expect(readStats("core").runs).toBe(1);
    first.unmount();

    const second = await mountLoop("survival");
    expect(second.result.current.state.phase).toBe("summary");
    expect(second.result.current.stats.runs).toBe(1);
    expect(readStats("core").runs).toBe(1);
  });

  it.each<GameMode>(["daily", "unlimited", "speed", "survival"])(
    "finalizes a completed %s run once when continuing past the last prompt",
    async (mode) => {
      questionCount = 2;
      const { result } = await mountLoop(mode);
      await startRun(result);

      await submit(result, recognizedResult);
      advanceToNextPrompt(result);
      await submit(result, recognizedResult);
      expect(result.current.state.phase).toBe("feedback");
      expect(readStats("core").runs).toBe(0);

      act(() => result.current.continueDive());
      expect(result.current.state.phase).toBe("summary");
      act(() => result.current.continueDive());

      // Two recognized answers at 60 points; Speed's multiplier only starts at a streak of three.
      expect(readStats("core")).toMatchObject({ runs: 1, bestScore: 120, lastScore: 120 });
      if (mode === "daily") expect(readStats("core").dailyStreak).toBe(1);
    },
  );

  it("keeps the better score as the best across runs", async () => {
    questionCount = 2;
    const { result } = await mountLoop("unlimited");
    await startRun(result);
    await submit(result, recognizedResult);
    advanceToNextPrompt(result);
    await submit(result, recognizedResult);
    act(() => result.current.continueDive());
    expect(readStats("core")).toMatchObject({ runs: 1, bestScore: 120 });

    await startRun(result);
    act(() => result.current.passQuestion());
    advanceToNextPrompt(result);
    act(() => result.current.passQuestion());
    act(() => result.current.continueDive());
    expect(readStats("core")).toMatchObject({ runs: 2, bestScore: 120, lastScore: 0 });
  });
});
