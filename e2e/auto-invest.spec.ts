import { test, expect } from "@playwright/test";

/**
 * 자동투자 현황(상세) 페이지 E2E: 로그인 후 자동투자 화면 접근·제목 확인.
 * E2E_USERNAME, E2E_PASSWORD 필요.
 */
test.describe("Auto-invest detail page", () => {
  test.beforeEach(async ({ page }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    if (!username || !password) {
      test.skip(true, "E2E_USERNAME and E2E_PASSWORD required for auto-invest E2E");
      return;
    }
    await page.goto("/login");
    await page.getByLabel("아이디").fill(username);
    await page.getByLabel("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("auto-invest route shows heading when authenticated", async ({ page }) => {
    await page.goto("/auto-invest");
    await expect(page.getByRole("heading", { name: "자동투자 현황" })).toBeVisible({
      timeout: 10000,
    });
  });
});
