import { defineConfig, devices } from "@playwright/test";

const requestedPort = process.env.OMNIQUIZ_PLAYWRIGHT_PORT ?? "3017";
const playwrightPort = /^\d{2,5}$/.test(requestedPort) ? requestedPort : "3017";
const localBaseUrl = `http://127.0.0.1:${playwrightPort}`;
const configuredBaseUrl = process.env.BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: configuredBaseUrl ?? localBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: configuredBaseUrl
    ? undefined
    : {
        command: `npm.cmd run dev -- --hostname 127.0.0.1 --port ${playwrightPort}`,
        url: localBaseUrl,
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
