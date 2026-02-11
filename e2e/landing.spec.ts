import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows brand and main content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/./);
    await expect(page.getByText("Investment Choi").first()).toBeVisible();
  });

  test("navigates to login from landing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /로그인|Login/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});
