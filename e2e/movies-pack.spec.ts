import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

type AtlasQuestion = { id: string; answers: Array<{ label: string; share: number }> };
const moviesBank = JSON.parse(
  readFileSync(new URL("../src/data/packs/movies.json", import.meta.url), "utf8"),
) as AtlasQuestion[];
const atlas = new Map(moviesBank.map((question) => [question.id, question]));

test.describe("Movies pack", () => {
  test("the packs page offers Movies as playable and keeps Sports and Music honest", async ({ page }) => {
    await page.goto("/packs");

    const movies = page.getByRole("link", { name: /cinema boulevard/i });
    await expect(movies).toHaveAttribute("href", "/packs/movies");
    await expect(page.getByRole("link", { name: /sports/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^music/i })).toHaveCount(0);
    const planned = page.locator("article.world-card");
    await expect(planned).toHaveCount(2);
    await expect(planned.nth(0)).toContainText(/sports/i);
    await expect(planned.nth(0)).toContainText(/coming soon/i);
    await expect(planned.nth(1)).toContainText(/music/i);
    await expect(planned.nth(1)).toContainText(/coming soon/i);
  });

  test("plays a real Movies round from the pack route through scored feedback", async ({ page }) => {
    const questionResponse = page.waitForResponse((response) =>
      response.url().includes("/api/questions") && response.request().method() === "GET",
    );

    await page.goto("/packs/movies");
    await expect(page.getByText("CINEMA BOULEVARD / THE LATE SHOW")).toBeVisible();
    await expect(page.getByRole("button", { name: /daily mode/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /speed mode/i })).toBeVisible();

    await page.getByRole("button", { name: /start the show/i }).click();
    const response = await questionResponse;
    expect(response.url()).toContain("pack=movies");
    expect(response.url()).not.toContain("category=");

    const payload = await response.json();
    expect(payload.data).toHaveLength(15);
    const first = payload.data[0] as { id: string; category: string; prompt: string };
    expect(first.id).toMatch(/^movies-\d{3}$/);
    expect(Object.keys(first).sort()).toEqual(["category", "id", "prompt"]);
    expect(JSON.stringify(payload)).not.toMatch(/answers|aliases|insight/);

    const answer = page.getByPlaceholder(/your answer/i);
    await expect(answer).toBeVisible({ timeout: 6_000 });
    await expect(page.getByText(/film atlas/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: first.prompt })).toBeVisible();

    const topAnswer = atlas.get(first.id)?.answers[0];
    expect(topAnswer).toBeTruthy();
    await answer.fill(topAnswer!.label);
    await page.getByRole("button", { name: /^submit$/i }).click();

    const status = page.getByRole("status");
    await expect(status).toContainText(/extra|too clever|supporting role|cult find|deep cut|one of a kind/i);
    await expect(status).toContainText(topAnswer!.label);
    await expect(status).toContainText(/atlas share/i);
    await expect(status).toContainText(/common answers/i);
    await expect(page.getByRole("button", { name: /next scene/i })).toBeFocused();

    // Feedback copy, including the atlas insight, speaks cinema; answer labels are film content.
    let feedbackCopy = (await status.innerText()).toLowerCase();
    for (const entry of atlas.get(first.id)?.answers ?? []) {
      feedbackCopy = feedbackCopy.replaceAll(entry.label.toLowerCase(), "");
    }
    expect(feedbackCopy).not.toMatch(
      /\b(dive|depth|descent|surface|ocean|current|tide|trench|abyss|shallows|expedition|explorers)\b/i,
    );
  });

  test("switches Movies modes inside the pack and rejects unsupported modes", async ({ page }) => {
    await page.goto("/packs/movies");
    await page.getByRole("button", { name: /speed mode/i }).click();
    await expect(page).toHaveURL(/\/packs\/movies\?mode=speed$/);
    await expect(page.getByText("CINEMA BOULEVARD / SPEED RUN")).toBeVisible();

    await page.goto("/packs/movies?mode=daily");
    await expect(page.getByText("CINEMA BOULEVARD / THE LATE SHOW")).toBeVisible();

    const daily = await page.request.get("/api/questions?pack=movies&mode=daily");
    expect(daily.status()).toBe(400);
    const sports = await page.request.get("/api/questions?pack=sports&mode=unlimited");
    expect(sports.status()).toBe(400);
  });

  test("planned and unknown pack routes show the not-found page", async ({ page }) => {
    for (const path of ["/packs/sports", "/packs/music", "/packs/polka"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
      await expect(page.getByText("SIGNAL LOST").first()).toBeVisible();
    }
  });

  test("keeps Movies progress out of the core routes", async ({ page }) => {
    await page.goto("/packs/movies");
    await page.getByRole("button", { name: /start the show/i }).click();
    await expect(page.getByPlaceholder(/your answer/i)).toBeVisible({ timeout: 6_000 });

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("omniquiz-progress-v3") ?? "{}"));
    expect(stored.pack).toBe("movies");

    await page.goto("/unlimited/classic");
    await expect(page.getByText("ARCADE EXPEDITION")).toBeVisible();
    await expect(page.getByRole("button", { name: /launch the rov/i })).toBeVisible();
    await expect(page.getByPlaceholder(/your answer/i)).toHaveCount(0);
  });

  test("submits an answer with the keyboard and survives a mid-round reload", async ({ page }) => {
    await page.goto("/packs/movies?mode=speed");
    await page.getByRole("button", { name: /start the clock/i }).click();
    const answer = page.getByPlaceholder(/your answer/i);
    await expect(answer).toBeVisible({ timeout: 6_000 });

    await answer.fill("no such movie thing");
    await answer.press("Enter");
    await expect(page.getByRole("status")).toContainText(/not in the atlas/i);

    await page.reload();
    await expect(page.getByRole("button", { name: /continue|next prompt/i })).toBeVisible({ timeout: 6_000 });
  });

  test("Movies routes stay inside the viewport on a narrow phone", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    for (const path of ["/packs", "/packs/movies"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow, path).toBe(false);
    }
  });
});
