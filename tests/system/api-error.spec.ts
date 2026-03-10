import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import { goToDashboard, goToTrading, goToPortfolio, goToAutoInvest } from "../utils/navigation";

test.describe("API 오류 감지", () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");
    await login(page);
  });

  test("주요 페이지 로드 중 HTTP 500/400/timeout 미발생", async ({ page }) => {
    const failures: { url: string; status?: number; error?: string }[] = [];
    page.on("response", (res) => {
      const status = res.status();
      const url = res.url();
      if (status >= 400) {
        failures.push({ url, status });
      }
    });
    page.on("requestfailed", (req) => {
      const f = req.failure();
      if (f?.errorText?.includes("net::ERR") || f?.errorText?.includes("Timeout")) {
        failures.push({ url: req.url(), error: f.errorText ?? "timeout" });
      }
    });

    await goToDashboard(page);
    await page.waitForTimeout(1500);
    await goToTrading(page);
    await page.waitForTimeout(1500);
    await goToPortfolio(page);
    await page.waitForTimeout(1500);
    await goToAutoInvest(page);
    await page.waitForTimeout(1500);

    const bad = failures.filter(
      (f) =>
        f.status === 500 ||
        f.status === 400 ||
        (f.error && (f.error.includes("Timeout") || f.error.includes("ERR_")))
    );
    expect(
      bad,
      `API 오류 발생: ${JSON.stringify(bad)}. 500/400/timeout 없어야 함.`
    ).toHaveLength(0);
  });
});
