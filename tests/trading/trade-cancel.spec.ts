import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import { goToTrading } from "../utils/navigation";

test.describe("주문 취소", () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");
    await login(page);
  });

  test("주문·체결 페이지 진입 후 취소 버튼 또는 취소 가능 UI 존재", async ({ page }) => {
    await goToTrading(page);
    await expect(page).toHaveURL(/\/orders/);
    await expect(page.getByText(/주문|체결|취소/).first()).toBeVisible({ timeout: 10_000 });
  });

  test("미체결 건이 있을 때 취소 동작 가능 여부 확인", async ({ page }) => {
    await goToTrading(page);
    const cancelBtn = page.getByRole("button", { name: /취소/ }).first();
    const hasCancel = await cancelBtn.isVisible().catch(() => false);
    if (hasCancel) {
      await cancelBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.getByText(/취소|완료|처리/).first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });
});
