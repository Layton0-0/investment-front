import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests assume:
 * - Frontend: npm run dev (http://localhost:5173)
 * - Backend: optional for full flows; Vite proxies /api to localhost:8080
 * Run with: npm run e2e
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  /* Start frontend automatically when running e2e. If Vite fails (e.g. unresolved deps), run `npm run dev` in another terminal and then `npm run e2e`. */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
