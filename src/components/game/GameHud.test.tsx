// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ANSWER_SECONDS, createInitialGameState, gameReducer } from "./gameReducer";
import { GameHud } from "./GameHud";

const questions = [
  { id: "general-001", category: "General" as const, prompt: "Name a warm current." },
];

const answeringState = () => {
  let state = gameReducer(createInitialGameState("daily"), {
    type: "LOAD_QUESTIONS",
    questions,
  });
  state = gameReducer(state, { type: "PREVIEW_TICK" });
  state = gameReducer(state, { type: "PREVIEW_TICK" });
  state = gameReducer(state, { type: "PREVIEW_TICK" });
  return state;
};

describe("GameHud timer", () => {
  afterEach(cleanup);

  it("renders smooth millisecond progress and a truthful 13.5-second label", () => {
    const state = answeringState();
    const { container } = render(
      <GameHud
        state={{ ...state, remainingSeconds: 2 }}
        mode="daily"
        remainingMilliseconds={1_500}
      />,
    );

    const timer = screen.getByRole("timer");
    const dial = container.querySelector<HTMLElement>(".hud-timer-dial");

    expect(timer).toHaveAttribute("aria-label", "2 seconds remaining");
    expect(timer).toHaveAttribute("data-window-state", "open");
    expect(dial?.style.getPropertyValue("--timer-progress")).toBe("0.1");
    expect(screen.getByText("02")).toBeInTheDocument();
  });

  it("uses explicit armed and closed semantics instead of a frozen countdown", () => {
    const preview = gameReducer(createInitialGameState("daily"), {
      type: "LOAD_QUESTIONS",
      questions,
    });
    const feedback = gameReducer(answeringState(), { type: "TIME_EXPIRED" });

    const { rerender } = render(
      <GameHud
        state={preview}
        mode="daily"
        remainingMilliseconds={ANSWER_SECONDS * 1_000}
      />,
    );
    expect(screen.getByRole("timer")).toHaveAttribute("aria-label", "Answer window armed");
    expect(screen.getByText("ARMED")).toBeInTheDocument();

    rerender(<GameHud state={feedback} mode="daily" remainingMilliseconds={0} />);
    expect(screen.getByRole("timer")).toHaveAttribute("aria-label", "Answer window closed");
    expect(screen.getByText("CLOSED")).toBeInTheDocument();
  });
});
