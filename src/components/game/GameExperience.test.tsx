// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicQuestion } from "../../lib/questions/types";
import { GameExperience } from "./GameExperience";

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

describe("GameExperience", () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: answerResult, error: null }),
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
  });

  it("expands all six tutorial rules", () => {
    render(<GameExperience mode="daily" />);

    fireEvent.click(screen.getByRole("button", { name: /how to play/i }));

    expect(screen.getByText(/seven prompts a day/i)).toBeVisible();
    expect(screen.getByText(/one dive per day/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /how to play/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
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
    expect(screen.getByRole("status")).toHaveTextContent(/no points lost/i);
    expect(screen.getByRole("button", { name: /surface with score/i })).toHaveFocus();
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
    expect(screen.getByText(/endless run complete/i)).toBeVisible();

    view.unmount();
    render(<GameExperience mode="unlimited" />);
    await act(async () => {});
    expect(screen.getByText(/endless run complete/i)).toBeVisible();

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
