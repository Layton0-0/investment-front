import { test, expect } from "@playwright/test";
import { login, getTestCredentials } from "../utils/login";
import {
  goToDashboard,
  goToTrading,
  goToStrategyKr,
  goToPortfolio,
  ROUTES,
} from "../utils/navigation";

test.describe("페이지 이동", () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getTestCredentials();
    test.skip(!username || !password, "E2E_USERNAME/E2E_PASSWORD 또는 SUPER_ADMIN_* 미설정");
    await login(page);
  });

  test("대시보드 이동 및 로딩 확인", async ({ page }) => {
    await goToDashboard(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.DASHBOARD.replace("/", "\\/")));
  });

  test("주문·체결(트레이딩) 이동 및 로딩 확인", async ({ page }) => {
    await goToTrading(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.TRADING_ORDERS.replace("/", "\\/")));
  });

  test("국내 전략 이동 및 로딩 확인", async ({ page }) => {
    await goToStrategyKr(page);
    await expect(page).toHaveURL(/\/strategies\/kr/);
  });

  test("포트폴리오 이동 및 로딩 확인", async ({ page }) => {
    await goToPortfolio(page);
    await expect(page).toHaveURL(new RegExp(ROUTES.PORTFOLIO.replace("/", "\\/")));
  });
});
