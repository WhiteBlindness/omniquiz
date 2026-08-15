// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SubmissionResult } from "../../lib/game/scoring";
import type { PublicQuestion } from "../../lib/questions/types";
import { getUtcDateKey } from "../../lib/questions/date";
import { SUBMISSION_TIMEOUT_MS } from "../../hooks/useGameLoop";
import { PROGRESS_STORAGE_KEY } from "./storage";
import { GameExperience } from "./GameExperience";

const { replaceRoute } = vi.hoisted(() => ({ replaceRoute: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceRoute }),
}));

const question: PublicQuestion = Object.freeze({
  id: "general-001",
  category: "General",
  prompt: "Name a warm current.",
});

const secondQuestion: PublicQuestion = Object.freeze({
  id: "general-002",
  category: "General",
  prompt: "Name a night habit.",
});

const answerResult: SubmissionResult = Object.freeze({
  recognized: true,
  normalizedAnswer: "gulfstream",
  answerLabel: "Gulf Stream",
  crowdShare: 7.5,
  tier: "rare",
  score: 60,
  depthMetres: 600,
  quip: "A sharp current with a quieter route.",
  commonAnswers: Object.freeze([
    { label: "Check their phone", share: 34 },
    { label: "Read", share: 19 },
  ]),
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
  commonAnswers: Object.freeze([{ label: "Check their phone", share: 34 }]),
});

let submissionResult: SubmissionResult = answerResult;
let submissionShouldHang = false;
let submissionShouldResolveLate = false;
let resolveLateSubmission: (() => void) | null = null;

describe("GameExperience", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    submissionResult = answerResult;
    submissionShouldHang = false;
    submissionShouldResolveLate = false;
    resolveLateSubmission = null;
    replaceRoute.mockReset();
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).includes("/api/questions")) {
          return Promise.resolve({
            ok: true,
            headers: { get: () => null },
            json: async () => ({ success: true, data: [question, secondQuestion], error: null }),
          });
        }

        expect(init?.method).toBe("POST");
        if (submissionShouldHang) {
          return new Promise((_, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("The operation was aborted.", "AbortError"));
            });
          });
        }
        if (submissionShouldResolveLate) {
          return new Promise((resolve) => {
            resolveLateSubmission = () => resolve({
              ok: true,
              json: async () => ({ success: true, data: submissionResult, error: null }),
            });
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: submissionResult, error: null }),
        });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    resolveLateSubmission = null;
  });

  const startAnswering = async (mode: "daily" | "unlimited" = "daily") => {
    const view = render(<GameExperience mode={mode} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /begin descent/i }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    return view;
  };

  it("keeps the ocean launch and explains crowd rarity play", () => {
    render(<GameExperience mode="daily" />);

    expect(screen.getByRole("heading", { name: "OMNIQUIZ" })).toBeVisible();
    expect(screen.getByText("THE DAILY DIVE")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /how to play/i }));
    expect(screen.getByText(/answer families, not one fixed fact/i)).toBeVisible();
    expect(screen.getByText(/pass, timeout, or an uncharted answer scores zero/i)).toBeVisible();
    expect(screen.queryByText(/penalty|sudden death/i)).not.toBeInTheDocument();
  });

  it("switches to unlimited mode without changing the visual launch direction", () => {
    render(<GameExperience mode="daily" />);
    fireEvent.click(screen.getByRole("button", { name: /unlimited mode/i }));

    expect(screen.getByText("THE ARCADE DIVE")).toBeVisible();
    expect(screen.getByRole("button", { name: /unlimited mode/i })).toHaveAttribute("aria-pressed", "true");
    expect(replaceRoute).toHaveBeenCalledWith("/unlimited/classic");
  });

  it("shows share, points, depth, canonical label, and common comparisons", async () => {
    const { container } = await startAnswering();
    const input = screen.getByPlaceholderText(/type one answer/i);
    fireEvent.change(input, { target: { value: "Gulf Stream" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^dive$/i }));
    });

    expect(screen.getByRole("status")).toHaveTextContent(/rare catch/i);
    expect(screen.getByRole("status")).toHaveTextContent(/7\.5%/i);
    expect(screen.getByRole("status")).toHaveTextContent(/\+60.*points/i);
    expect(screen.getByRole("status")).toHaveTextContent(/\+600m descent/i);
    expect(screen.getByRole("status")).toHaveTextContent(/common signals/i);
    expect(screen.getByRole("button", { name: /continue descent/i })).toHaveFocus();
    expect(container.querySelector(".ocean-backdrop")).toHaveAttribute("data-descent", "active");
    const backdrop = container.querySelector<HTMLElement>(".ocean-backdrop");
    expect(backdrop?.style.getPropertyValue("--descent-shift")).toMatch(/px$/);
    expect(backdrop?.style.getPropertyValue("--descent-duration")).toMatch(/ms$/);
    expect(screen.getByRole("status")).toHaveAttribute("data-feedback-delay", "180ms");
  });

  it("requests the current daily UTC identity without a browser cache", async () => {
    await startAnswering();

    const questionsRequest = vi.mocked(fetch).mock.calls.find(([input]) =>
      String(input).includes("/api/questions"),
    );
    expect(questionsRequest?.[0]).toContain(`date=${getUtcDateKey()}`);
    expect(questionsRequest?.[1]).toMatchObject({ cache: "no-store" });
  });

  it("shows a smooth 13.5-second progress value from the absolute deadline", async () => {
    const { container } = await startAnswering();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(13_500);
    });

    expect(container.querySelector(".hud-timer-dial")?.getAttribute("style")).toContain(
      "--timer-progress: 0.1",
    );
    expect(container.querySelector(".timecode-plate")).toHaveTextContent("WINDOW T-00:01.5");
    expect(container.querySelector(".answer-progress span")?.getAttribute("style")).toContain(
      "scaleX(0.1)",
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(container.querySelector(".timecode-plate")).toHaveTextContent("WINDOW T-00:01.4");
  });

  it("keeps the answer window actionable through the real final second", async () => {
    await startAnswering();
    const timer = screen.getByRole("timer");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(13_500);
    });
    expect(timer).toHaveAttribute("aria-label", "2 seconds remaining");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(499);
    });
    expect(timer).toHaveAttribute("aria-label", "2 seconds remaining");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(timer).toHaveAttribute("aria-label", "1 second remaining");
    expect(screen.getByPlaceholderText(/type one answer/i)).toBeEnabled();
    expect(document.querySelector(".game-shell")).toHaveAttribute("data-phase", "answering");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(999);
    });
    expect(timer).toHaveAttribute("aria-label", "1 second remaining");
    expect(screen.getByPlaceholderText(/type one answer/i)).toBeEnabled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByRole("status")).toHaveTextContent(/time expired/i);
  });

  it("accepts a submission clicked before the deadline when the response crosses it", async () => {
    submissionShouldResolveLate = true;
    await startAnswering();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(14_000);
    });
    fireEvent.change(screen.getByPlaceholderText(/type one answer/i), {
      target: { value: "Gulf Stream" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^dive$/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    expect(screen.queryByText(/time expired/i)).not.toBeInTheDocument();

    await act(async () => {
      resolveLateSubmission?.();
      await Promise.resolve();
    });
    expect(screen.getByRole("status")).toHaveTextContent(/rare catch/i);
  });

  it("lets unlimited runs continue after an uncharted answer", async () => {
    submissionResult = unchartedResult;
    const { container } = await startAnswering("unlimited");
    fireEvent.change(screen.getByPlaceholderText(/type one answer/i), {
      target: { value: "purple quantum walrus" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^dive$/i }));
    });
    expect(screen.getByRole("status")).toHaveTextContent(/uncharted/i);
    expect(container.querySelector(".ocean-backdrop")).toHaveAttribute("data-descent", "idle");
    const backdrop = container.querySelector<HTMLElement>(".ocean-backdrop");
    expect(backdrop?.style.getPropertyValue("--descent-shift")).toBe("");
    fireEvent.click(screen.getByRole("button", { name: /continue descent/i }));
    expect(screen.getByText("Name a night habit.")).toBeVisible();
  });

  it("surfaces a full dive log after the final prompt", async () => {
    await startAnswering();
    fireEvent.change(screen.getByPlaceholderText(/type one answer/i), {
      target: { value: "Gulf Stream" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^dive$/i }));
    });
    fireEvent.click(screen.getByRole("button", { name: /continue descent/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    fireEvent.click(screen.getByRole("button", { name: /pass/i }));
    fireEvent.click(screen.getByRole("button", { name: /surface with log/i }));

    expect(screen.getByText("DIVE LOG")).toBeVisible();
    expect(screen.getByText("Gulf Stream")).toBeVisible();
    expect(screen.getByText("PASS")).toBeVisible();
  });

  it("returns to answering when submission exceeds its deadline", async () => {
    submissionShouldHang = true;
    await startAnswering();
    fireEvent.change(screen.getByPlaceholderText(/type one answer/i), {
      target: { value: "Gulf Stream" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^dive$/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SUBMISSION_TIMEOUT_MS);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/timed out/i);
    expect(screen.getByPlaceholderText(/type one answer/i)).toBeEnabled();
    expect(screen.getByRole("timer")).not.toHaveAttribute("aria-label", "15 seconds remaining");
  });

  it("resyncs the absolute deadline immediately after visibility resumes", async () => {
    const { container } = await startAnswering();
    const suspendedAt = Date.now();

    vi.setSystemTime(suspendedAt + 4_000);
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(container.querySelector(".timecode-plate")).toHaveTextContent("WINDOW T-00:11.0");
    expect(screen.getByRole("timer")).toHaveAttribute("aria-label", "11 seconds remaining");
  });

  it("times out an expired restored answering record without showing a fresh window", async () => {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 3,
        mode: "daily",
        dailyDate: getUtcDateKey(),
        phase: "answering",
        questions: [question, secondQuestion],
        questionIndex: 0,
        score: 0,
        depthMetres: 0,
        answer: "",
        remainingSeconds: 0,
        previewSeconds: 0,
        lastResult: null,
        lastOutcome: null,
        roundLog: [],
        savedAt: 0,
      }),
    );

    render(<GameExperience mode="daily" />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByRole("status")).toHaveTextContent(/time expired/i);
    expect(screen.getByRole("timer")).toHaveAttribute("aria-label", "Answer window closed");
    expect(screen.queryByPlaceholderText(/type one answer/i)).not.toBeInTheDocument();
  });
});
