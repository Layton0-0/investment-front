/**
 * Route path constants for navigation.
 * Use these instead of hardcoding path strings across components.
 */

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  AUTO_INVEST: "/auto-invest",
  STRATEGIES_KR: "/strategies/kr",
  STRATEGIES_US: "/strategies/us",
  NEWS: "/news",
  PORTFOLIO: "/portfolio",
  ORDERS: "/orders",
  SETTINGS: "/settings",
  LOGIN: "/login",
  SIGNUP: "/signup",
  MYPAGE: "/mypage",
  BATCH: "/batch",
  BACKTEST: "/backtest",
  OPS_DATA: "/ops/data",
  OPS_ALERTS: "/ops/alerts",
  OPS_RISK: "/risk",
  OPS_MODEL: "/ops/model",
  OPS_AUDIT: "/ops/audit",
  OPS_HEALTH: "/ops/health",
  OPS_GOVERNANCE: "/ops/governance"
} as const;

/** Dashboard quick-nav: ordered labels and path map */
export const DASHBOARD_QUICK_NAV_LABELS = [
  "국내전략",
  "미국전략",
  "뉴스·이벤트",
  "포트폴리오",
  "주문·체결",
  "설정"
] as const;

export const DASHBOARD_QUICK_NAV_PATH: Record<(typeof DASHBOARD_QUICK_NAV_LABELS)[number], string> = {
  국내전략: ROUTES.STRATEGIES_KR,
  미국전략: ROUTES.STRATEGIES_US,
  "뉴스·이벤트": ROUTES.NEWS,
  포트폴리오: ROUTES.PORTFOLIO,
  "주문·체결": ROUTES.ORDERS,
  설정: ROUTES.SETTINGS
};
