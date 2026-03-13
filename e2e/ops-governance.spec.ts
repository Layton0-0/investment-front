import { test, expect } from "@playwright/test";

/**
 * Ops 전략 거버넌스 뷰 E2E.
 * - 비인증 시 로그인으로 리다이렉트되는지 확인.
 * - 인증 후 /ops/governance 진입 시 거버넌스 UI(검사 결과·halt 목록)가 노출되는지 확인.
 */
test.describe("Ops Governance tab", () => {
  test("unauthenticated user is redirected to login when visiting /ops/governance", async ({
    page,
  }) => {
    await page.goto("/ops/governance");
    await expect(page).toHaveURL(/\/login/);
  });

  test("authenticated user sees governance view at /ops/governance", async ({
    page,
  }) => {
    // 로그인 (환경 변수 또는 기본 테스트 계정 사용 가능 시)
    const username = process.env.E2E_USERNAME ?? "admin";
    const password = process.env.E2E_PASSWORD ?? "admin";
    await page.goto("/login");
    await page.getByLabel("아이디").fill(username);
    await page.getByLabel("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/(dashboard|risk|ops)/, { timeout: 10000 });

    await page.goto("/ops/governance");
    await expect(page).toHaveURL(/\/ops\/governance/);

    // 거버넌스 뷰: 검사 결과 또는 활성 Halt 목록 카드가 보여야 함 (데이터 없으면 빈 메시지)
    const governanceContent = page.getByText(/전략 거버넌스|검사 결과|활성 Halt|검사 결과가 없습니다|활성 halt가 없습니다|로딩 중/);
    await expect(governanceContent.first()).toBeVisible({ timeout: 10000 });
  });
});
