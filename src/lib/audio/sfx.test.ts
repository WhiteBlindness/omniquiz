import { describe, expect, it, vi } from "vitest";

import { createSfx } from "./sfx";

describe("createSfx", () => {
  it("exposes rarity-play cues through the shared player", () => {
    const play = vi.fn();
    const sfx = createSfx(play);

    sfx.reveal();
    sfx.uncharted();

    expect(play).toHaveBeenNthCalledWith(1, "reveal");
    expect(play).toHaveBeenNthCalledWith(2, "uncharted");
  });

  it("keeps button, mission-start, and submit cues available", () => {
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
