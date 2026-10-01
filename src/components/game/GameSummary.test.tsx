// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_STATS } from "./storage";
import { GameSummary } from "./GameSummary";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const baseProps = {
  score: 350,
  depthMetres: 3_500,
  stats: DEFAULT_STATS,
  roundLog: [],
  shareLabel: "SHARE EXPEDITION LOG",
  onReplay: () => undefined,
  onShare: () => undefined,
};

describe("GameSummary", () => {
  afterEach(cleanup);

  it("reports the daily score as a share of the maximum, not a player percentile", () => {
    render(<GameSummary {...baseProps} mode="daily" />);

    expect(screen.getByText("SHARE OF DAILY MAX")).toBeVisible();
    expect(screen.getByText("50%")).toBeVisible();
    expect(screen.getByText(/of the 700-point daily maximum/i)).toBeVisible();
    expect(screen.queryByText(/percentile/i)).not.toBeInTheDocument();
  });

  it("links back to all packs after a pack run and to the daily dive after core runs", () => {
    const { rerender } = render(<GameSummary {...baseProps} mode="speed" pack="movies" />);
    expect(screen.getByRole("link", { name: "ALL PACKS" })).toHaveAttribute("href", "/packs");

    rerender(<GameSummary {...baseProps} mode="speed" />);
    expect(screen.getByRole("link", { name: "TODAY'S EXPEDITION" })).toHaveAttribute("href", "/");
  });
});
