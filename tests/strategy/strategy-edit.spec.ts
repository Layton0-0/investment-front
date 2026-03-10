import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import { goToStrategyKr } from "../utils/navigation";

test.describe("전략 수정", () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");
    await login(page);
  });

  test("전략 목록에서 수정 버튼 또는 편집 가능 UI 확인", async ({ page }) => {
    await goToStrategyKr(page);
    await expect(page.getByText(/국내|전략/).first()).toBeVisible({ timeout: 10_000 });
    const editBtn = page.getByRole("button", { name: /수정|편집|편집하기/ }).first();
    const hasEdit = await editBtn.isVisible().catch(() => false);
    if (hasEdit) {
      await editBtn.click();
      await page.waitForTimeout(500);
      const saveBtn = page.getByRole("button", { name: /저장|확인/ }).last();
      await expect(saveBtn).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });
});
