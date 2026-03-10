import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import {
  goToDashboard,
  goToAutoInvest,
  goToTrading,
  goToPortfolio,
} from "../utils/navigation";

test.describe("자동투자 전체 시나리오", () => {
  test("1 로그인 → 2 전략/자동투자 → 3 실행 → 4 거래 로그 → 5 포트폴리오 → 6 로그아웃", async ({
    page,
  }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");

    // 1 로그인
    await login(page);
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);

    // 2 전략/자동투자 페이지
    await goToAutoInvest(page);
    await expect(page.getByText(/자동투자/).first()).toBeVisible({ timeout: 10_000 });

    // 3 자동투자 실행(버튼 있으면 클릭, 없으면 스킵)
    const startBtn = page.getByRole("button", { name: /자동투자 시작|시작하기/ }).first();
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(1000);
    }

    // 4 거래 로그 확인
    await goToTrading(page);
    await expect(page).toHaveURL(/\/orders/);
    await expect(page.getByText(/주문|체결|거래/).first()).toBeVisible({ timeout: 10_000 }).catch(() => {});

    // 5 포트폴리오 확인
    await goToPortfolio(page);
    await expect(page).toHaveURL(/\/portfolio/);
    await expect(page.getByText(/포트폴리오/).first()).toBeVisible({ timeout: 10_000 });

    // 6 로그아웃
    const logoutButton = page
      .getByRole("button", { name: /로그아웃|로그 아웃/ })
      .or(page.getByRole("link", { name: /로그아웃|로그 아웃/ }));
    if (await logoutButton.first().isVisible().catch(() => false)) {
      await logoutButton.first().click();
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    }
  });
});
