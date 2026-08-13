// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppStateProvider, useAppState } from "./AppStateProvider";

function StateProbe({ label }: Readonly<{ label: string }>) {
  const { theme, toggleTheme } = useAppState();

  return (
    <button type="button" onClick={toggleTheme}>
      {label}: {theme}
    </button>
  );
}

describe("AppStateProvider", () => {
  it("shares theme changes with every consumer and persists the preference", () => {
    render(
      <AppStateProvider>
        <StateProbe label="one" />
        <StateProbe label="two" />
      </AppStateProvider>,
    );

    expect(screen.getByRole("button", { name: "one: dark" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "one: dark" }));

    expect(screen.getByRole("button", { name: "one: light" })).toBeVisible();
    expect(screen.getByRole("button", { name: "two: light" })).toBeVisible();
    expect(localStorage.getItem("omniquiz-theme-v1")).toBe('"light"');
  });
});
