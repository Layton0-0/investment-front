import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests assume:
 * - Frontend: npm run dev (http://localhost:5173)
 * - Backend: optional for full flows. 기본 8080, E2E_API_PORT=8084 시 8084 사용(Agent 검증용).
 * Run: npm run e2e
 * Run with 8084 backend: E2E_API_PORT=8084 E2E_USERNAME=... E2E_PASSWORD=... npm run e2e
 */
const apiPort = process.env.E2E_API_PORT || "8080";
const apiBaseUrl = `http://localhost:${apiPort}`;

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
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { ...process.env, VITE_API_BASE_URL: apiBaseUrl },
  },
});
