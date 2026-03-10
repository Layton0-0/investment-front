import { test, expect } from "@playwright/test";
import { expectLoginPageVisible, getTestCredentials } from "../utils/login";

test.describe("로그인", () => {
  test("로그인 페이지 로드 및 폼 표시", async ({ page }) => {
    await expectLoginPageVisible(page);
  });

  test("빈 값 제출 시 검증 메시지 표시", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page.getByText(/입력해 주세요/).first()).toBeVisible({ timeout: 5000 });
  });

  test("유효한 계정으로 로그인 성공", async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_USERNAME/SUPER_ADMIN_PASSWORD 미설정");

    await page.goto("/login");
    await page.getByLabel("아이디").fill(username);
    await page.getByLabel("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });
  });
});
