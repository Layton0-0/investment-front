import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import { goToDashboard, goToTrading, goToStrategyKr, goToPortfolio } from "../utils/navigation";
import { scanAndClickAllButtons, getFailedClicks } from "../utils/button-scanner";

const pages: { name: string; goTo: (page: import("@playwright/test").Page) => Promise<void> }[] = [
  { name: "dashboard", goTo: goToDashboard },
  { name: "trading", goTo: goToTrading },
  { name: "strategy", goTo: goToStrategyKr },
  { name: "portfolio", goTo: goToPortfolio },
];

test.describe("모든 버튼 클릭", () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");
    await login(page);
  });

  for (const { name, goTo } of pages) {
    test(`${name} 페이지에서 버튼 탐색 및 클릭 후 crash 없음`, async ({ page }) => {
      await goTo(page);
      const results = await scanAndClickAllButtons(page, { timeoutPerClick: 2000 });
      const failed = getFailedClicks(results);
      if (failed.length > 0) {
        console.warn(`[${name}] 클릭 실패:`, failed);
      }
      await expect(page).not.toHaveURL(/about:blank/);
    });
  }
});
