import { test, expect } from "@playwright/test";

/**
 * 대시보드 E2E: 로그인 후 대시보드 접근 및 자산 API(accounts/.../assets) 404 미발생 검증.
 * E2E_USERNAME, E2E_PASSWORD가 설정된 경우에만 로그인·대시보드 검증 실행.
 * 프론트는 VITE_API_BASE_URL로 백엔드(기본 8080, E2E_API_PORT=8084 시 8084) 사용.
 */
const hasCredentials =
  process.env.E2E_USERNAME != null &&
  process.env.E2E_USERNAME !== "" &&
  process.env.E2E_PASSWORD != null &&
  process.env.E2E_PASSWORD !== "";

test.describe("Dashboard", () => {
  test("dashboard loads after login and no asset 404", async ({ page }) => {
    test.skip(!hasCredentials, "E2E_USERNAME and E2E_PASSWORD must be set for this test");

    const failedRequests: { url: string; status: number }[] = [];
    page.on("response", (res) => {
      const url = res.url();
      const status = res.status();
      if (url.includes("/api/v1/accounts/") && url.includes("/assets") && status === 404) {
        failedRequests.push({ url, status });
      }
    });

    await page.goto("/login");
    await expect(page.getByLabel("아이디")).toBeVisible();
    await page.getByLabel("아이디").fill(process.env.E2E_USERNAME!);
    await page.getByLabel("비밀번호").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "로그인" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(3000);

    expect(
      failedRequests,
      `Asset API must not return 404. Failed: ${JSON.stringify(failedRequests)}`
    ).toHaveLength(0);
  });

  test("dashboard page shows heading when navigated directly (auth required)", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login|\/dashboard/, { timeout: 10000 });
    if (page.url().includes("/dashboard")) {
      await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible({ timeout: 5000 });
    }
  });
});
