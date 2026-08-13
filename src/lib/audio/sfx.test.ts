import { describe, expect, it, vi } from "vitest";

import { createSfx } from "./sfx";

describe("createSfx", () => {
  it("exposes named 8-bit effects through the shared player", () => {
    const play = vi.fn();
    const sfx = createSfx(play);

    sfx.correct();
    sfx.wrong();
    sfx.gameOver();

    expect(play).toHaveBeenNthCalledWith(1, "correct");
    expect(play).toHaveBeenNthCalledWith(2, "wrong");
    expect(play).toHaveBeenNthCalledWith(3, "gameOver");
  });

  it("keeps button and mission-start cues available", () => {
    const play = vi.fn();
    const sfx = createSfx(play);

    sfx.click();
    sfx.start();
    sfx.submit();

    expect(play).toHaveBeenNthCalledWith(1, "click");
    expect(play).toHaveBeenNthCalledWith(2, "start");
    expect(play).toHaveBeenNthCalledWith(3, "submit");
  });
});
