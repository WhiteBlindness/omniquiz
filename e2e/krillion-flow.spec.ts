import { expect, test } from "@playwright/test";

test.describe("OMNIQUIZ ocean loop", () => {
  test("landing selects modes and persists the visible theme state", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: /daily mode/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.getByRole("button", { name: /arcade mode/i }).click();
    await expect(page).toHaveURL(/\/unlimited\/classic$/);
    await expect(page.getByText("THE ARCADE DIVE")).toBeVisible();
    await expect(page.getByText(/15 rounds \/ sudden death/i)).toBeVisible();

    await page.reload();
    await expect(page.getByText("THE ARCADE DIVE")).toBeVisible();

    await page.getByRole("button", { name: /switch to light theme/i }).click();
    await expect(page.locator(".game-shell")).toHaveAttribute("data-theme", "light");
  });

  test("home, tutorial, start, answer, and feedback are reachable", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "OMNIQUIZ" })).toBeVisible();
    await expect(page.getByText("THE DAILY DIVE")).toBeVisible();

    await page.getByRole("button", { name: /how to play/i }).click();
    await expect(page.getByText(/seven prompts a day/i)).toBeVisible();

    await page.getByRole("button", { name: /begin descent/i }).click();
    await expect(page.getByText(/descent begins in/i)).toBeVisible();

    const answer = page.getByPlaceholder(/type one answer/i);
    await expect(answer).toBeVisible({ timeout: 5_000 });
    await answer.fill("curiosity");
    await page.getByRole("button", { name: /^dive$/i }).click();

    await expect(page.getByRole("status")).toContainText(/answer logged/i);
  });

  test("mobile keeps the scene and action inside the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    await expect(page.getByRole("button", { name: /begin descent/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sound/i })).toBeVisible();

    const interactiveRects = await page
      .locator(".game-shell a, .game-shell button, .game-shell input")
      .evaluateAll((elements) =>
        elements
          .filter((element) => {
            const style = getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden";
          })
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
          }),
      );
    expect(interactiveRects.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);

    const ruler = await page.getByLabel("Depth scale").boundingBox();
    expect(ruler).not.toBeNull();
    expect(ruler!.x).toBeGreaterThanOrEqual(0);
    expect(ruler!.x + ruler!.width).toBeLessThanOrEqual(320);
  });

  test("pass produces distinct feedback and feedback replaces the prompt stage", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /begin descent/i }).click();
    await expect(page.getByRole("button", { name: /^pass$/i })).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: /^pass$/i }).click();

    await expect(page.getByRole("status")).toContainText(/pass logged/i);
    await expect(page.getByRole("status")).toContainText(/penalty applied/i);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.getByRole("button", { name: /continue descent/i })).toBeFocused();
  });

  test("arcade ends immediately on a wrong answer and offers play again", async ({ page }) => {
    await page.route("**/api/questions**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "x-omniquiz-day": "001" },
        body: JSON.stringify({
          success: true,
          data: [{
            id: "general-001",
            category: "General",
            prompt: "Name a warm current.",
            difficulty: "easy",
            rarity: { tier: "rare", score: 60, depth: 0.6 },
          }],
          error: null,
        }),
      }),
    );
    await page.route("**/api/submit", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            accepted: false,
            normalizedAnswer: "mars",
            tier: "rare",
            score: 0,
            depth: 0.6,
            quip: "Not this time; keep the curiosity alive.",
          },
          error: null,
        }),
      }),
    );

    await page.goto("/unlimited/classic");
    await page.getByRole("button", { name: /begin descent/i }).click();
    const answer = page.getByPlaceholder(/type one answer/i);
    await expect(answer).toBeVisible({ timeout: 5_000 });
    await answer.fill("Mars");
    await page.getByRole("button", { name: /^dive$/i }).click();

    await expect(page.getByRole("heading", { name: "GAME OVER" })).toBeVisible();
    await expect(page.getByText("FINAL SCORE")).toBeVisible();
    await expect(page.getByRole("button", { name: /play again/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /continue descent/i })).toHaveCount(0);
  });

  test("restoring browser preferences does not create hydration errors", async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && message.text().includes("Hydration failed")) {
        hydrationErrors.push(message.text());
      }
    });
    await page.addInitScript(() => {
      localStorage.setItem("omniquiz-preferences-v1", JSON.stringify({ muted: true }));
      localStorage.setItem(
        "omniquiz-stats-v1",
        JSON.stringify({ runs: 4, answers: 20, correct: 11, bestScore: 245, lastScore: 170 }),
      );
    });

    await page.goto("/");
    await page.waitForTimeout(500);

    expect(hydrationErrors).toEqual([]);
    await expect(page.getByRole("button", { name: /sound is muted/i })).toBeVisible();
  });

  test("restores scored feedback after a page reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /begin descent/i }).click();
    await expect(page.getByPlaceholder(/type one answer/i)).toBeVisible({ timeout: 5_000 });

    await page.getByPlaceholder(/type one answer/i).fill("curiosity");
    await page.getByRole("button", { name: /^dive$/i }).click();
    await expect(page.getByRole("status")).toContainText(/answer logged/i);

    await page.reload();

    await expect(page.getByRole("status")).toContainText(/answer logged/i);
    await expect(page.getByRole("status")).toBeVisible();
  });

  test("makes active packs playable and keeps music and restore honest", async ({ page }) => {
    await page.goto("/packs");

    await expect(page.getByRole("link", { name: /at the movies/i })).toHaveAttribute(
      "href",
      "/unlimited/classic?category=History",
    );
    await expect(page.getByRole("link", { name: /sports/i })).toHaveAttribute(
      "href",
      "/unlimited/classic?category=General",
    );
    await expect(page.getByText(/music/i)).toBeVisible();
    await expect(page.getByText(/coming soon/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /local only/i })).toBeDisabled();
  });

  test("returns different deterministic question sets for consecutive unlimited runs", async ({ page }) => {
    const first = await page.request.get("/api/questions?mode=unlimited&run=1");
    const second = await page.request.get("/api/questions?mode=unlimited&run=2");
    const firstBody = await first.json();
    const secondBody = await second.json();

    expect(first.ok()).toBe(true);
    expect(second.ok()).toBe(true);
    expect(firstBody.data.map((question: { id: string }) => question.id)).not.toEqual(
      secondBody.data.map((question: { id: string }) => question.id),
    );
  });
});
