import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("loads login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("아이디")).toBeVisible();
    await expect(page.getByLabel("비밀번호")).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  });

  test("shows validation on empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page.getByText(/입력해 주세요/).first()).toBeVisible({ timeout: 5000 });
  });
});
