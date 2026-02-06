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
  date: string;
  items: TradingPortfolioItemDto[];
  riskManagementStrategy?: string;
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

