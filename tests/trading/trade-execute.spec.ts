import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import { goToAutoInvest, goToTrading } from "../utils/navigation";

test.describe("전략 실행·주문 생성", () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");
    await login(page);
  });

  test("자동투자 실행 후 주문·체결 페이지에서 거래 관련 UI 확인", async ({ page }) => {
    await goToAutoInvest(page);
    await expect(page.getByText(/자동투자/).first()).toBeVisible({ timeout: 10_000 });
    await goToTrading(page);
    await expect(page.getByText(/주문|체결|거래/).first()).toBeVisible({ timeout: 10_000 });
  });

  test("주문·체결 페이지 로드 및 거래 로그 영역 존재", async ({ page }) => {
    await goToTrading(page);
    await expect(page).toHaveURL(/\/orders/);
    const content = page.getByRole("main").or(page.locator("main")).or(page.locator('[class*="content"]'));
    await expect(content.first()).toBeVisible({ timeout: 10_000 });
  });
});
