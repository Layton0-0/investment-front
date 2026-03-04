import { test, expect } from "@playwright/test";

test.describe("Dashboard page", () => {
  test.beforeEach(async ({ page }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    if (!username || !password) {
      test.skip(true, "E2E_USERNAME and E2E_PASSWORD required for dashboard tests");
      return;
    }
    await page.goto("/login");
    await page.getByLabel("아이디").fill(username);
    await page.getByLabel("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("dashboard route shows title and main sections when authenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("내 자산·자동투자 상태를 한눈에 확인하세요")).toBeVisible();

    await expect(page.getByText("총 자산").first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("총 수익률").first()).toBeVisible();
    await expect(page.getByText("일일 손익").first()).toBeVisible();
    await expect(page.getByText("리스크").first()).toBeVisible();
    await expect(page.getByText("자동투자 상태").first()).toBeVisible();
    await expect(page.getByText("보유 종목").first()).toBeVisible();
    await expect(page.getByText("최근 주문").first()).toBeVisible();
  });

  test("dashboard has link to auto-invest detail", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible({
      timeout: 10000,
    });
    const detailLink = page.getByRole("button", {
      name: /자동투자 현황 자세히 보기/,
    }).or(page.getByText("자동투자 현황 자세히 보기"));
    await expect(detailLink.first()).toBeVisible({ timeout: 5000 });
  });
});
