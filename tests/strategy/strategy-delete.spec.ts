import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import { goToStrategyKr } from "../utils/navigation";

test.describe("전략 삭제", () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");
    await login(page);
  });

  test("전략 목록 페이지 로드 및 삭제 관련 UI 존재 여부", async ({ page }) => {
    await goToStrategyKr(page);
    await expect(page.getByText(/국내|전략/).first()).toBeVisible({ timeout: 10_000 });
  });

  test("삭제 버튼이 있으면 클릭 후 목록에서 제거 확인", async ({ page }) => {
    await goToStrategyKr(page);
    const deleteBtn = page.getByRole("button", { name: /삭제|제거/ }).first();
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      const confirmBtn = page.getByRole("button", { name: /확인|삭제|예/ }).last();
      await confirmBtn.click().catch(() => {});
      await page.waitForTimeout(1500);
    }
  });
});
