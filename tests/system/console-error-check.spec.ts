import { test } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import { checkConsoleErrors, assertNoConsoleErrors } from "../utils/error-checker";
import { goToDashboard, goToTrading, goToStrategyKr, goToPortfolio, goToAutoInvest } from "../utils/navigation";

const pages: { name: string; path: string }[] = [
  { name: "dashboard", path: "/dashboard" },
  { name: "trading", path: "/orders" },
  { name: "strategy", path: "/strategies/kr" },
  { name: "portfolio", path: "/portfolio" },
  { name: "auto-invest", path: "/auto-invest" },
];

test.describe("콘솔 에러 검사", () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");
    await login(page);
  });

  for (const { name, path } of pages) {
    test(`${name} 페이지 진입 후 console.error/warn 수집, 에러 시 실패`, async ({ page }) => {
      const logs = checkConsoleErrors(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(1500);
      assertNoConsoleErrors(logs, `console-error-check-${name}`);
    });
  }
});
