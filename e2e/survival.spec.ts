import { expect, test } from "@playwright/test";

const readCoreStats = (page: import("@playwright/test").Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("omniquiz-stats-v2") ?? "null") as { runs: number } | null);

test.describe("Survival", () => {
  test("a run that loses every life is recorded once and stays recorded after a reload", async ({ page }) => {
    await page.goto("/survival");
    await page.getByRole("button", { name: /enter the abyss/i }).click();

    for (let life = 3; life > 0; life -= 1) {
      const answer = page.getByPlaceholder(/your answer/i);
      await expect(answer).toBeVisible({ timeout: 8_000 });
      await answer.press("Escape");
      if (life > 1) {
        await expect(page.locator('[data-phase="feedback"]')).toBeVisible();
        await page.keyboard.press("Enter");
      }
    }

    // The last life ends the run without a feedback step.
    await expect(page.locator('[data-phase="summary"]')).toBeVisible();
    await expect(page.getByText(/all lives lost/i)).toBeVisible();
    await expect(page.getByText(/runs 1/i)).toBeVisible();
    expect((await readCoreStats(page))?.runs).toBe(1);

    await page.reload();
    await expect(page.locator('[data-phase="summary"]')).toBeVisible();
    expect((await readCoreStats(page))?.runs).toBe(1);
  });
});
