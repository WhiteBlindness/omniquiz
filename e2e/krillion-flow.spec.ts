import { expect, test } from "@playwright/test";

test.describe("OMNIQUIZ ocean loop", () => {
  test("home, tutorial, start, answer, and feedback are reachable", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "OMNIQUIZ" })).toBeVisible();
    await expect(page.getByText("THE DAILY DIVE")).toBeVisible();

    await page.getByRole("button", { name: /how to play/i }).click();
    await expect(page.getByText(/seven prompts a day/i)).toBeVisible();

    await page.getByRole("button", { name: /begin descent/i }).click({ force: true });
    await expect(page.getByText(/descent begins in/i)).toBeVisible();
    await page.waitForTimeout(3_200);

    const answer = page.getByPlaceholder(/type one answer/i);
    await expect(answer).toBeVisible();
    await answer.fill("curiosity");
    await page.getByRole("button", { name: /^dive$/i }).click();

    await expect(page.getByText(/answer logged/i)).toBeVisible();
    await expect(page.getByRole("status")).toContainText(/answer logged/i);
  });

  test("mobile keeps the scene and action inside the viewport", async ({ page }) => {
    await page.goto("/");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    await expect(page.getByRole("button", { name: /begin descent/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sound/i })).toBeVisible();
  });

  test("restores scored feedback after a page reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /begin descent/i }).click({ force: true });
    await page.waitForTimeout(3_200);

    await page.getByPlaceholder(/type one answer/i).fill("curiosity");
    await page.getByRole("button", { name: /^dive$/i }).click();
    await expect(page.getByText(/answer logged/i)).toBeVisible();

    await page.reload();

    await expect(page.getByText(/answer logged/i)).toBeVisible();
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
