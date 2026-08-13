// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SubmissionResult } from "../../lib/game/scoring";
import type { PublicQuestion } from "../../lib/questions/types";
import { SUBMISSION_TIMEOUT_MS } from "../../hooks/useGameLoop";
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

describe("GameExperience", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    submissionResult = answerResult;
    submissionShouldHang = false;
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
  });

  const startAnswering = async (mode: "daily" | "unlimited" = "daily") => {
    render(<GameExperience mode={mode} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /begin descent/i }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
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
    await startAnswering();
    const input = screen.getByPlaceholderText(/type one answer/i);
    fireEvent.change(input, { target: { value: "Gulf Stream" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^dive$/i }));
    });

    expect(screen.getByRole("status")).toHaveTextContent(/rare catch/i);
    expect(screen.getByRole("status")).toHaveTextContent(/7\.5%/i);
    expect(screen.getByRole("status")).toHaveTextContent(/\+60.*points/i);
    expect(screen.getByRole("status")).toHaveTextContent(/common signals/i);
    expect(screen.getByRole("button", { name: /continue descent/i })).toHaveFocus();
  });

  it("lets unlimited runs continue after an uncharted answer", async () => {
    submissionResult = unchartedResult;
    await startAnswering("unlimited");
    fireEvent.change(screen.getByPlaceholderText(/type one answer/i), {
      target: { value: "purple quantum walrus" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^dive$/i }));
    });
    expect(screen.getByRole("status")).toHaveTextContent(/uncharted/i);
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
  });
});
