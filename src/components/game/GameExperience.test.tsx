// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicQuestion } from "../../lib/questions/types";
import type { SubmissionResult } from "../../lib/game/scoring";
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
  difficulty: "easy",
  rarity: Object.freeze({ tier: "rare", score: 60, depth: 0.6 }),
});

const answerResult = Object.freeze({
  accepted: true,
  normalizedAnswer: "gulf stream",
  tier: "rare",
  score: 60,
  depth: 0.6,
  quip: "A sharp bit of recall.",
});

const wrongAnswerResult = Object.freeze({
  accepted: false,
  normalizedAnswer: "mars",
  tier: "rare",
  score: 0,
  depth: 0.6,
  quip: "Not this time; keep the curiosity alive.",
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
            json: async () => ({ success: true, data: [question], error: null }),
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

  it("renders the ocean title and keeps the primary action reachable", () => {
    render(<GameExperience mode="daily" />);

    expect(screen.getByRole("heading", { name: "OMNIQUIZ" })).toBeVisible();
    expect(screen.getByText("THE DAILY DIVE")).toBeVisible();
    expect(screen.getByRole("button", { name: /begin descent/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /how to play/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: /daily mode/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /arcade mode/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("switches the landing session from daily to arcade before launch", async () => {
    const fetchMock = vi.mocked(fetch);
    render(<GameExperience mode="daily" />);

    fireEvent.click(screen.getByRole("button", { name: /arcade mode/i }));

    expect(screen.getByText("THE ARCADE DIVE")).toBeVisible();
    expect(screen.getByRole("button", { name: /arcade mode/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(replaceRoute).toHaveBeenCalledWith("/unlimited/classic");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /begin descent/i }));
    });

    expect(fetchMock.mock.calls.some(([input]) => String(input).includes("mode=unlimited"))).toBe(
      true,
    );
  });

  it("toggles the shared theme from the landing controls", () => {
    render(<GameExperience mode="daily" />);

    const shell = document.querySelector(".game-shell");
    const themeButton = screen.getByRole("button", { name: /switch to light theme/i });

    expect(shell).toHaveAttribute("data-theme", "dark");
    fireEvent.click(themeButton);

    expect(shell).toHaveAttribute("data-theme", "light");
    expect(screen.getByRole("button", { name: /switch to dark theme/i })).toBeVisible();
  });

  it("explains the daily penalty in the tutorial", () => {
    render(<GameExperience mode="daily" />);

    fireEvent.click(screen.getByRole("button", { name: /how to play/i }));

    expect(screen.getByText(/seven prompts a day/i)).toBeVisible();
    expect(screen.getByText(/miss costs 50 points/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /how to play/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("explains arcade sudden death and its difficulty ramp", () => {
    render(<GameExperience mode="unlimited" />);

    fireEvent.click(screen.getByRole("button", { name: /how to play/i }));

    expect(screen.getByText(/one miss.*ends the run/i)).toBeVisible();
    expect(screen.getByText(/rounds 1.?3.*easy/i)).toBeVisible();
    expect(screen.getByText(/rounds 4.?7.*medium/i)).toBeVisible();
    expect(screen.getByText(/round 8.*hard/i)).toBeVisible();
  });

  it("starts a preview, enables the answer form, and shows server feedback", async () => {
    render(<GameExperience mode="daily" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /begin descent/i }));
    });

    expect(screen.getByText(/descent begins in/i)).toBeVisible();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });

    const input = screen.getByPlaceholderText(/type one answer/i);
    const dive = screen.getByRole("button", { name: /^dive$/i });
    expect(input).toBeVisible();
    expect(dive).toBeDisabled();

    fireEvent.change(input, { target: { value: "Gulf Stream" } });
    expect(dive).toBeEnabled();

    await act(async () => {
      fireEvent.click(dive);
    });

    expect(screen.getByRole("status")).toHaveTextContent(/answer logged/i);
    expect(screen.getByText(/a sharp bit of recall/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /continue descent|surface with score/i }),
    ).toHaveFocus();
  });

  it("surfaces a daily score percentile after the final prompt", async () => {
    render(<GameExperience mode="daily" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /begin descent/i }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    fireEvent.change(screen.getByPlaceholderText(/type one answer/i), {
      target: { value: "Gulf Stream" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^dive$/i }));
    });
    fireEvent.click(screen.getByRole("button", { name: /surface with score/i }));

    expect(screen.getByText("EST. SCORE PERCENTILE")).toBeVisible();
    expect(screen.getByText("P09")).toBeVisible();
  });

  it("lets a player pass without waiting for the answer timer", async () => {
    render(<GameExperience mode="daily" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /begin descent/i }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });

    fireEvent.click(screen.getByRole("button", { name: /^pass$/i }));

    expect(screen.getByRole("status")).toHaveTextContent(/pass logged/i);
    expect(screen.getByRole("status")).toHaveTextContent(/penalty applied/i);
    expect(screen.getByRole("status")).toHaveTextContent(/50 pt penalty/i);
    expect(screen.getByRole("button", { name: /surface with score/i })).toHaveFocus();
  });

  it("recovers the answer form when submission exceeds its deadline", async () => {
    submissionShouldHang = true;
    render(<GameExperience mode="daily" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /begin descent/i }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    fireEvent.change(screen.getByPlaceholderText(/type one answer/i), {
      target: { value: "Gulf Stream" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^dive$/i }));
    expect(screen.getByRole("button", { name: /logging/i })).toBeDisabled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SUBMISSION_TIMEOUT_MS);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/timed out/i);
    expect(screen.getByPlaceholderText(/type one answer/i)).toBeEnabled();
  });

  it("ends arcade mode immediately on a wrong answer with a play-again action", async () => {
    submissionResult = wrongAnswerResult;
    render(<GameExperience mode="unlimited" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /begin descent/i }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    fireEvent.change(screen.getByPlaceholderText(/type one answer/i), {
      target: { value: "Mars" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^dive$/i }));
    });

    expect(screen.getByRole("heading", { name: "GAME OVER" })).toBeVisible();
    expect(screen.getByText("FINAL SCORE")).toBeVisible();
    expect(screen.getByRole("button", { name: /play again/i })).toBeVisible();
    expect(screen.getByRole("link", { name: "TODAY'S DIVE" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /continue descent/i })).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /play again/i }));
    });
    expect(screen.getByText(/descent begins in/i)).toBeVisible();
  });

  it("announces the final five seconds without relying on color alone", async () => {
    render(<GameExperience mode="daily" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /begin descent/i }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });

    expect(screen.getByText(/5 seconds left/i)).toBeVisible();
    expect(screen.getByLabelText(/5 seconds remaining/i)).toHaveAttribute(
      "data-urgency",
      "critical",
    );
  });

  it("restores scored feedback after a reload-equivalent remount", async () => {
    const view = render(<GameExperience mode="daily" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /begin descent/i }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    fireEvent.change(screen.getByPlaceholderText(/type one answer/i), {
      target: { value: "Gulf Stream" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^dive$/i }));
    });
    expect(screen.getByText(/a sharp bit of recall/i)).toBeVisible();

    view.unmount();
    render(<GameExperience mode="daily" />);
    await act(async () => {});

    expect(screen.getByRole("status")).toHaveTextContent(/answer logged/i);
    expect(screen.getByText(/a sharp bit of recall/i)).toBeVisible();
  });

  it("restores a finished summary and requests a fresh unlimited run", async () => {
    const fetchMock = vi.mocked(fetch);
    const view = render(<GameExperience mode="unlimited" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /begin descent/i }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    fireEvent.change(screen.getByPlaceholderText(/type one answer/i), {
      target: { value: "Gulf Stream" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^dive$/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /surface with score/i }));
    });
    expect(screen.getByText(/arcade run complete/i)).toBeVisible();

    view.unmount();
    render(<GameExperience mode="unlimited" />);
    await act(async () => {});
    expect(screen.getByText(/arcade run complete/i)).toBeVisible();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /dive again/i }));
    });

    const questionRequests = fetchMock.mock.calls
      .map(([input]) => String(input))
      .filter((input) => input.includes("/api/questions"));
    expect(questionRequests).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/mode=unlimited.*run=1/),
        expect.stringMatching(/mode=unlimited.*run=2/),
      ]),
    );
  });

  it("threads an unlimited category into the question request", async () => {
    const fetchMock = vi.mocked(fetch);
    render(<GameExperience mode="unlimited" category="History" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /begin descent/i }));
    });

    expect(
      fetchMock.mock.calls.some(([input]) =>
        String(input).includes("mode=unlimited") && String(input).includes("category=History"),
      ),
    ).toBe(true);
  });
});
