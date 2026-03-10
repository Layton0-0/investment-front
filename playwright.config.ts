import { defineConfig, devices } from "@playwright/test";

/**
 * 자동투자 서비스 E2E QA 시스템
 * - Frontend: npm run dev (http://localhost:5173) 또는 baseURL
 * - Backend: E2E_API_PORT 미설정 시 8080, Agent 검증 시 E2E_API_PORT=8084
 * - 로그인: E2E_USERNAME, E2E_PASSWORD 환경 변수 (미설정 시 로그인 테스트 스킵 가능)
 *
 * 실행: npm run test:e2e
 * UI 모드: npm run test:e2e:ui
 * 디버그: npm run test:e2e:debug
 * 리포트만: npm run test:e2e:report
 *
 * 환경: local | docker | CI (CI=true 시 재시도·워커·서버 재사용 조정)
 */
const apiPort = process.env.E2E_API_PORT || "8080";
const apiBaseUrl = `http://localhost:${apiPort}`;
const isCI = !!process.env.CI;

/** 기본 Chromium만 사용. Windows 등에서 Firefox 기동 실패(exitCode 3221225477) 방지. 전체 브라우저: E2E_BROWSERS=all */
const projects =
  process.env.E2E_BROWSERS === "all"
    ? [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "firefox", use: { ...devices["Desktop Firefox"] } },
        { name: "webkit", use: { ...devices["Desktop Safari"] } },
      ]
    : [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }];

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/global-setup.ts",
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  outputDir: "test-results/artifacts",
  reporter: [
    ["html", { outputFolder: "test-results/html-report", open: "never" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects,
  webServer: {
    command: "npm run dev",
    url: process.env.E2E_BASE_URL || "http://localhost:5173",
    reuseExistingServer: !isCI,
    timeout: 60_000,
    env: { ...process.env, VITE_API_BASE_URL: apiBaseUrl },
  },
});
