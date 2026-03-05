import { test, expect } from "@playwright/test";

/**
 * 설정 페이지 E2E: 로그인 후 설정 화면 접근·제목·탭 확인.
 * E2E_USERNAME, E2E_PASSWORD 필요.
 */
test.describe("Settings page", () => {
  test.beforeEach(async ({ page }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    if (!username || !password) {
      test.skip(true, "E2E_USERNAME and E2E_PASSWORD required for settings E2E");
      return;
    }
    await page.goto("/login");
    await page.getByLabel("아이디").fill(username);
    await page.getByLabel("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("settings route shows heading and profile tabs when authenticated", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "설정" })).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByText("계좌·API·거래 설정·자동투자 ON/OFF").first()
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("tab", { name: "초보자" })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("tab", { name: "중급자" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "고급" })).toBeVisible();
  });
});
