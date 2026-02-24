import { apiFetch } from "./http";

export interface TradingPortfolioItemDto {
  symbol: string;
  name?: string;
  market?: string;
  entryPrice?: string;
  targetPrice?: string;
  stopLossPrice?: string;
  reason?: string;
  weight?: string;
}

export interface TradingPortfolioDto {
  /** 백엔드 응답 필드 (yyyy-MM-dd) */
  tradingDate?: string;
  /** 프론트 호환용. 표시 시 tradingDate ?? date 사용 */
  date?: string;
  items: TradingPortfolioItemDto[];
  riskManagementStrategy?: string;
}

/** 포트폴리오 날짜 표시용 (undefined 방지) */
export function getPortfolioDisplayDate(p: TradingPortfolioDto | null | undefined): string {
  if (!p) return "";
  return p.tradingDate ?? p.date ?? "";
}

export function getTodayPortfolio() {
  return apiFetch<TradingPortfolioDto>("/api/v1/trading-portfolios/today", { method: "GET" });
}

/** 특정 날짜 포트폴리오 조회 (yyyy-MM-dd). */
export function getPortfolioByDate(date: string): Promise<TradingPortfolioDto> {
  return apiFetch<TradingPortfolioDto>(
    `/api/v1/trading-portfolios/date/${encodeURIComponent(date)}`,
    { method: "GET" }
  );
}

/** 최신 포트폴리오 목록 (limit 기본 10). */
export function getLatestPortfolios(limit = 10): Promise<TradingPortfolioDto[]> {
  return apiFetch<TradingPortfolioDto[]>(
    `/api/v1/trading-portfolios/latest?limit=${limit}`,
    { method: "GET" }
  );
}

/** 수동 생성 (date 미지정 시 오늘). */
export function generatePortfolio(date?: string): Promise<TradingPortfolioDto> {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  return apiFetch<TradingPortfolioDto>("/api/v1/trading-portfolios/generate" + qs, {
    method: "POST"
  });
}

/** 리밸런싱 제안 1건 */
export interface RebalanceItemDto {
  symbol?: string;
  side?: string;
  quantity?: number;
  notional?: number;
}

/** 리밸런싱 제안 응답 (GET /api/v1/trading-portfolios/rebalance-suggestions) */
export interface RebalanceSuggestionsDto {
  market?: string;
  totalValue?: number;
  items?: RebalanceItemDto[];
}

export function getRebalanceSuggestions(accountNo: string, market = "US"): Promise<RebalanceSuggestionsDto> {
  return apiFetch<RebalanceSuggestionsDto>(
    `/api/v1/trading-portfolios/rebalance-suggestions?accountNo=${encodeURIComponent(accountNo)}&market=${encodeURIComponent(market)}`,
    { method: "GET" }
  );
}

