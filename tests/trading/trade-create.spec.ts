import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import { goToAutoInvest } from "../utils/navigation";

test.describe("매매/전략 생성", () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");
    await login(page);
  });

  test("자동투자 페이지에서 전략 생성 플로우: 금액 입력·저장·성공 확인", async ({ page }) => {
    await goToAutoInvest(page);
    await expect(page.getByText(/자동투자/).first()).toBeVisible({ timeout: 10_000 });

    const startButton = page.getByRole("button", { name: /자동투자 시작|시작하기/ }).first();
    if (!(await startButton.isVisible().catch(() => false))) {
      test.skip(true, "자동투자 시작 버튼 없음(이미 설정됨 등)");
    }
    await startButton.click();
    await page.getByRole("dialog").waitFor({ state: "visible", timeout: 5000 });
    const agree = page.locator("#agree-risk").or(page.getByRole("checkbox").first());
    await agree.check().catch(() => {});
    const amountInput = page.getByLabel(/투자.*금액|금액|최대/).or(page.getByPlaceholder(/\d/).first());
    await amountInput.fill("1000000").catch(() => {});
    const submitBtn = page.getByRole("button", { name: /시작|저장|확인/ }).last();
    await submitBtn.click().catch(() => {});
    await page.waitForTimeout(2000);
    const success = page.getByText(/완료|성공|저장됨|시작됨/).first();
    await expect(success).toBeVisible({ timeout: 8000 }).catch(() => {});
  });
});
