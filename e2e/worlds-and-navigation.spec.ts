import { expect, test, type Page } from "@playwright/test";

const OCEAN_TERMS = /\b(dive|diving|depth|descent|descend|descending|surface|ocean|submarine|rov|abyss|krillion|plankton|schooler|metres|uncharted|signal)\b/i;

const beginRun = async (page: Page, label: RegExp) => {
  await page.getByRole("button", { name: label }).click();
  await expect(page.getByPlaceholder(/type one answer/i)).toBeVisible({ timeout: 8_000 });
};

const passAndContinue = async (page: Page) => {
  await page.getByPlaceholder(/type one answer/i).press("Escape");
  await expect(page.locator('[data-phase="feedback"]')).toBeVisible();
  await page.keyboard.press("Enter");
  if (await page.locator('[data-phase="preview"]').count()) await page.keyboard.press(" ");
};

const visibleText = (page: Page) =>
  page.evaluate(() => {
    const root = document.querySelector(".game-shell");
    if (!root) return "";
    const clone = root.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".worlds-strip, .site-footer, .sr-only").forEach((node) => node.remove());
    const labels = Array.from(clone.querySelectorAll("[aria-label]")).map((node) => node.getAttribute("aria-label"));
    return [clone.innerText, ...labels, document.title].join("\n");
  });

const pseudoContent = (page: Page) =>
  page.evaluate(() =>
    [".brand-stage", ".landing-console", ".game-hud"].flatMap((selector) =>
      ["::before", "::after"].map((pseudo) => {
        const node = document.querySelector(selector);
        return node ? getComputedStyle(node, pseudo).content : "";
      }),
    ).join(" "),
  );

test.describe("worlds and navigation", () => {
  test.setTimeout(90_000);

  test("the packs page leads with Core and Movies and marks Sports and Music as coming soon", async ({ page }) => {
    await page.goto("/packs");

    await expect(page.getByRole("link", { name: /the ocean dive/i })).toHaveAttribute("href", "/");
    await expect(page.getByRole("link", { name: /at the movies/i })).toHaveAttribute("href", "/packs/movies");
    const planned = page.locator("article.world-card");
    await expect(planned).toHaveCount(2);
    await expect(planned.nth(0)).toContainText(/sports/i);
    await expect(planned.nth(1)).toContainText(/music/i);
    await expect(page.getByRole("link", { name: /sports|music/i })).toHaveCount(0);
  });

  test("the landing page offers the worlds without burying the daily dive", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /begin descent/i })).toBeVisible();
    const strip = page.locator(".worlds-strip");
    await expect(strip.getByRole("link", { name: /at the movies/i })).toHaveAttribute("href", "/packs/movies");
    await expect(strip.locator("article")).toHaveCount(2);
  });

  test("core keeps the ocean world and Movies uses the cinema world", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".game-shell")).toHaveAttribute("data-environment", "ocean");
    await expect(page.locator(".ocean-backdrop")).toHaveCount(1);
    await expect(page.locator(".cinema-backdrop")).toHaveCount(0);

    await page.goto("/packs/movies");
    await expect(page.locator(".game-shell")).toHaveAttribute("data-environment", "cinema");
    await expect(page.locator(".cinema-backdrop")).toHaveCount(1);
    await expect(page.locator(".ocean-backdrop")).toHaveCount(0);
  });

  test("Movies never shows ocean terminology while playing", async ({ page }) => {
    await page.goto("/packs/movies");
    expect(await visibleText(page)).not.toMatch(OCEAN_TERMS);
    expect(await pseudoContent(page)).not.toMatch(OCEAN_TERMS);

    await beginRun(page, /start the show/i);
    expect(await visibleText(page)).not.toMatch(OCEAN_TERMS);
    expect(await pseudoContent(page)).not.toMatch(OCEAN_TERMS);

    await page.getByPlaceholder(/type one answer/i).press("Escape");
    await expect(page.getByRole("status")).toContainText(/pass logged/i);
    expect(await visibleText(page)).not.toMatch(OCEAN_TERMS);

    await page.goto("/packs/movies?mode=speed");
    await beginRun(page, /start the clock/i);
    for (let round = 0; round < 10; round += 1) {
      await page.getByPlaceholder(/type one answer/i).press("Escape");
      await expect(page.locator('[data-phase="feedback"]')).toBeVisible();
      await page.keyboard.press("Enter");
      if (round === 9) break;
      await expect(page.getByPlaceholder(/type one answer/i)).toBeVisible({ timeout: 8_000 });
    }
    await expect(page.locator('[data-phase="summary"]')).toBeVisible({ timeout: 10_000 });
    expect(await visibleText(page)).not.toMatch(OCEAN_TERMS);
  });

  test("Movies progresses through its stages as the run advances", async ({ page }) => {
    await page.goto("/packs/movies");
    await beginRun(page, /start the show/i);
    await expect(page.locator(".game-shell")).toHaveAttribute("data-stage", "city-limits");

    for (let round = 0; round < 14; round += 1) {
      await passAndContinue(page);
      await expect(page.getByPlaceholder(/type one answer/i)).toBeVisible({ timeout: 8_000 });
    }
    await expect(page.locator(".game-shell")).toHaveAttribute("data-stage", "premiere-night");
    await expect(page.locator(".cinema-backdrop")).toHaveAttribute("data-stage", "4");
  });

  test("the Movies world stops its ambient motion when reduced motion is requested", async ({ page }) => {
    const loopingAnimations = () =>
      page.evaluate(() =>
        document
          .querySelector(".cinema-backdrop")!
          .getAnimations({ subtree: true })
          .filter((animation) => animation.effect?.getComputedTiming().iterations === Infinity).length,
      );

    await page.goto("/packs/movies");
    await expect(page.locator(".cinema-backdrop")).toBeVisible();
    expect(await loopingAnimations()).toBeGreaterThan(0);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await beginRun(page, /start the show/i);
    for (let round = 0; round < 2; round += 1) {
      await passAndContinue(page);
      await expect(page.getByPlaceholder(/type one answer/i)).toBeVisible({ timeout: 8_000 });
    }
    expect(await loopingAnimations()).toBe(0);
  });

  test("the logo returns home from a Movies pack page", async ({ page }) => {
    await page.goto("/packs/movies");
    await page.getByRole("link", { name: "OMNIQUIZ home" }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(".game-shell")).toHaveAttribute("data-environment", "ocean");
  });

  test("exiting from feedback needs no confirmation and the run stays resumable", async ({ page }) => {
    await page.goto("/packs/movies");
    await beginRun(page, /start the show/i);
    await page.getByPlaceholder(/type one answer/i).press("Escape");
    await expect(page.getByRole("status")).toContainText(/pass logged/i);

    await page.getByRole("button", { name: "Exit to home" }).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/packs\/movies$/);
    await expect(page.getByRole("status")).toContainText(/pass logged/i);
  });

  test("leaving during the answer clock asks first, and staying restores focus", async ({ page }) => {
    await page.goto("/");
    await beginRun(page, /begin descent/i);

    const exit = page.getByRole("button", { name: "Exit to home" });
    await exit.click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/clock keeps running/i);
    await expect(page.getByRole("button", { name: /keep playing/i })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('[data-phase="answering"]')).toBeVisible();
    await expect(exit).toBeFocused();
  });

  test("the logo takes the same guarded route as Exit, including on the daily route", async ({ page }) => {
    await page.goto("/");
    await beginRun(page, /begin descent/i);
    const prompt = await page.locator("#current-prompt").innerText();

    await page.locator(".hud-home").click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: /leave run/i }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("button", { name: /begin descent/i })).toBeVisible();
    const resume = page.getByRole("button", { name: /resume your saved run/i });
    await expect(resume).toBeVisible();

    await resume.click();
    await expect(page.locator("#current-prompt")).toHaveText(prompt);
  });

  test("a Movies run left mid-question resumes when the player returns to the pack", async ({ page }) => {
    await page.goto("/packs/movies");
    await beginRun(page, /start the show/i);
    const prompt = await page.locator("#current-prompt").innerText();

    await page.getByRole("button", { name: "Exit to home" }).click();
    await page.getByRole("button", { name: /leave run/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(".game-shell")).toHaveAttribute("data-environment", "ocean");
    await expect(page.getByRole("button", { name: /resume your saved run/i })).toHaveCount(0);

    await page.goto("/packs/movies");
    await expect(page.locator("#current-prompt")).toHaveText(prompt, { timeout: 8_000 });
  });

  test("Escape passes the prompt without also skipping the feedback screen", async ({ page }) => {
    await page.goto("/");
    await beginRun(page, /begin descent/i);
    await page.getByPlaceholder(/type one answer/i).press("Escape");

    await expect(page.getByRole("status")).toContainText(/pass logged/i);
    await page.waitForTimeout(600);
    await expect(page.locator('[data-phase="feedback"]')).toBeVisible();
  });
});
