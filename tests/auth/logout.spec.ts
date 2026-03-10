import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";

test.describe("로그아웃", () => {
  test("로그인 후 로그아웃 시 로그인 페이지로 이동", async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");

    await login(page);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    const sidebarLogout = page.getByRole("button", { name: /로그아웃|로그 아웃/ });
    if (await sidebarLogout.first().isVisible().catch(() => false)) {
      await sidebarLogout.first().click();
    } else {
      const userMenu = page.locator("button").filter({ has: page.locator("svg") }).last();
      await userMenu.click({ timeout: 5000 });
      await page.getByRole("menuitem", { name: /로그아웃/ }).click();
    }
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
