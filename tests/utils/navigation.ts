import { Page } from "@playwright/test";

/**
 * 앱 내 주요 경로 (AppRoutes 기준)
 */
export const ROUTES = {
  DASHBOARD: "/dashboard",
  AUTO_INVEST: "/auto-invest",
  TRADING_ORDERS: "/orders",
  STRATEGY_KR: "/strategies/kr",
  STRATEGY_US: "/strategies/us",
  PORTFOLIO: "/portfolio",
  SETTINGS: "/settings",
  LOGIN: "/login",
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * 대시보드로 이동 후 로딩 확인
 */
export async function goToDashboard(page: Page): Promise<void> {
  await page.goto(ROUTES.DASHBOARD);
  await page.waitForLoadState("networkidle").catch(() => {});
  await expectPageLoaded(page, "대시보드");
}

/**
 * 주문·체결(트레이딩) 페이지로 이동
 */
export async function goToTrading(page: Page): Promise<void> {
  await page.goto(ROUTES.TRADING_ORDERS);
  await page.waitForLoadState("networkidle").catch(() => {});
  await expectPageLoaded(page, "주문");
}

/**
 * 전략 페이지로 이동 (국내)
 */
export async function goToStrategyKr(page: Page): Promise<void> {
  await page.goto(ROUTES.STRATEGY_KR);
  await page.waitForLoadState("networkidle").catch(() => {});
  await expectPageLoaded(page, "국내");
}

/**
 * 전략 페이지로 이동 (미국)
 */
export async function goToStrategyUs(page: Page): Promise<void> {
  await page.goto(ROUTES.STRATEGY_US);
  await page.waitForLoadState("networkidle").catch(() => {});
  await expectPageLoaded(page, "미국");
}

/**
 * 포트폴리오 페이지로 이동
 */
export async function goToPortfolio(page: Page): Promise<void> {
  await page.goto(ROUTES.PORTFOLIO);
  await page.waitForLoadState("networkidle").catch(() => {});
  await expectPageLoaded(page, "포트폴리오");
}

/**
 * 자동투자 현황 페이지로 이동
 */
export async function goToAutoInvest(page: Page): Promise<void> {
  await page.goto(ROUTES.AUTO_INVEST);
  await page.waitForLoadState("networkidle").catch(() => {});
  await expectPageLoaded(page, "자동투자");
}

/**
 * URL 및 본문에 특정 텍스트가 있는지로 페이지 로딩 확인
 */
async function expectPageLoaded(page: Page, keyword: string): Promise<void> {
  await page.getByText(new RegExp(keyword, "i")).first().waitFor({ state: "visible", timeout: 10_000 });
}
