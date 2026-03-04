import { test, expect } from "@playwright/test";

/**
 * 초보자 온보딩 E2E: 로그인 → 퀴즈 3단계 → 원클릭 자동투자 시작 → 대시보드 핵심 지표 확인.
 * E2E_USERNAME, E2E_PASSWORD 필요. 테스트 사용자는 계좌가 연결되어 있어야 원클릭 시작이 성공함.
 */
test.describe("Onboarding flow", () => {
  test.beforeEach(async ({ page }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    if (!username || !password) {
      test.skip(true, "E2E_USERNAME and E2E_PASSWORD required for onboarding E2E");
      return;
    }
    await page.goto("/login");
    await page.getByLabel("아이디").fill(username);
    await page.getByLabel("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/(dashboard|login)/, { timeout: 15000 });
  });

  test("full flow: login → onboarding quiz 3 steps → one-click start → dashboard with 3 key metrics", async ({
    page,
  }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    if (!username || !password) {
      test.skip();
      return;
    }

    // 1. 온보딩 페이지로 이동
    await page.goto("/onboarding");
    await expect(page.getByRole("heading", { name: /초보자 온보딩/ })).toBeVisible({
      timeout: 10000,
    });

    // 2. 퀴즈 1단계: 투자 기간
    await expect(page.getByText("투자 기간").first()).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "1년" }).click();
    await page.getByRole("button", { name: "다음" }).click();

    // 3. 퀴즈 2단계: 손실 감수
    await expect(page.getByText(/손실 감수/).first()).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /약 -10% 남을 때/ }).click();
    await page.getByRole("button", { name: "다음" }).click();

    // 4. 퀴즈 3단계: 투자 예정 금액
    await expect(page.getByText("투자 예정 금액").first()).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "500만 원" }).click();
    await page.getByRole("button", { name: "결과 보기" }).click();

    // 5. 결과 화면: 나의 투자 성향
    await expect(page.getByRole("heading", { name: "나의 투자 성향" })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/균형|보수적|공격적/).first()).toBeVisible({ timeout: 3000 });

    // 스크린샷: 퀴즈 결과 (리포트용)
    await test.info().attach("onboarding-quiz-result", {
      body: await page.screenshot(),
      contentType: "image/png",
    });

    // 6. 자동투자 페이지로 이동 → 원클릭 시작
    await page.goto("/auto-invest");
    await expect(page.getByRole("heading", { name: "자동투자 현황" })).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("button", { name: "자동투자 시작하기" }).click();

    // 7. 다이얼로그: 위험 동의 + 금액 + 시작하기
    await expect(page.getByRole("dialog").getByText("자동투자 시작")).toBeVisible({
      timeout: 5000,
    });
    await page.getByLabel("위험을 인지하고 동의합니다").check();
    await page.getByRole("button", { name: "시작하기" }).click();

    // 8. 대시보드로 리다이렉트 (quick-start 성공 시). 계좌 미연결이면 에러 메시지가 나올 수 있음
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // 9. 대시보드 핵심 지표 3개 표시 확인 (총 자산, 수익률, MDD/일일손익 등)
    await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("총 자산").first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("총 수익률").or(page.getByText("수익률")).first()).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByText("일일 손익").or(page.getByText("MDD")).or(page.getByText("리스크")).first()
    ).toBeVisible({ timeout: 5000 });

    // 스크린샷: 대시보드 (리포트용)
    await test.info().attach("dashboard-after-onboarding", {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  });
});
