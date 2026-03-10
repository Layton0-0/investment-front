import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import { goToPortfolio } from "../utils/navigation";

test.describe("포트폴리오 조회", () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");
    await login(page);
  });

  test("포트폴리오 페이지 로드 및 제목 확인", async ({ page }) => {
    await goToPortfolio(page);
    await expect(page).toHaveURL(/\/portfolio/);
    await expect(page.getByText(/포트폴리오/).first()).toBeVisible({ timeout: 10_000 });
  });

  test("포트폴리오 영역(테이블 또는 카드) 표시", async ({ page }) => {
    await goToPortfolio(page);
    const main = page.getByRole("main").or(page.locator("main"));
    await expect(main.first()).toBeVisible({ timeout: 10_000 });
  });
});
