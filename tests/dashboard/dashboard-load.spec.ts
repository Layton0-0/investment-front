import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import { goToDashboard } from "../utils/navigation";

test.describe("대시보드 로드", () => {
  test("로그인 후 대시보드 진입 시 페이지 로딩 확인", async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");

    await login(page);
    await goToDashboard(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/대시보드|dashboard/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("비로그인 시 대시보드 접근 시 로그인으로 리다이렉트", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
