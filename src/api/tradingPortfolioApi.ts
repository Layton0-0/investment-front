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

