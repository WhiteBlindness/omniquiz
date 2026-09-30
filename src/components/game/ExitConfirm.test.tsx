// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ExitConfirm } from "./ExitConfirm";

describe("ExitConfirm", () => {
  afterEach(cleanup);

  it("is an accessible alert dialog that focuses the safe choice", () => {
    render(<ExitConfirm onStay={() => undefined} onLeave={() => undefined} />);

    const dialog = screen.getByRole("alertdialog", { name: /leave this run/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription(/clock keeps running/i);
    expect(screen.getByRole("button", { name: /keep playing/i })).toHaveFocus();
  });

  it("stays on Escape and leaves only on an explicit choice", () => {
    const onStay = vi.fn();
    const onLeave = vi.fn();
    render(<ExitConfirm onStay={onStay} onLeave={onLeave} />);

    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    expect(onStay).toHaveBeenCalledTimes(1);
    expect(onLeave).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /leave run/i }));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("keeps Tab focus inside the dialog", () => {
    render(<ExitConfirm onStay={() => undefined} onLeave={() => undefined} />);
    const stay = screen.getByRole("button", { name: /keep playing/i });
    const leave = screen.getByRole("button", { name: /leave run/i });

    leave.focus();
    fireEvent.keyDown(leave, { key: "Tab" });
    expect(stay).toHaveFocus();

    fireEvent.keyDown(stay, { key: "Tab", shiftKey: true });
    expect(leave).toHaveFocus();
  });
});
