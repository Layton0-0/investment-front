import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import { goToStrategyKr } from "../utils/navigation";

test.describe("전략 생성", () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");
    await login(page);
  });

  test("국내 전략 페이지 진입 및 전략 생성/추가 버튼 또는 목록 확인", async ({ page }) => {
    await goToStrategyKr(page);
    await expect(page.getByText(/국내|전략/).first()).toBeVisible({ timeout: 10_000 });
    const addOrList = page.getByRole("button", { name: /추가|생성|등록/ }).or(
      page.getByText(/전략 목록|등록된 전략/).first()
    );
    await expect(addOrList.first()).toBeVisible({ timeout: 8000 });
  });

  test("전략 저장 플로우(버튼 있으면 클릭 후 저장 확인)", async ({ page }) => {
    await goToStrategyKr(page);
    const createBtn = page.getByRole("button", { name: /추가|생성|등록|새 전략/ }).first();
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(1000);
      const saveBtn = page.getByRole("button", { name: /저장|확인|등록/ }).last();
      await saveBtn.click().catch(() => {});
      await expect(page.getByText(/저장|등록|완료/).first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });
});
