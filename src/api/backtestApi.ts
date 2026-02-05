import { apiFetch } from "./http";

export interface BacktestRunRequest {
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  market?: string; // KR|US
  strategyType?: string; // SHORT_TERM|MEDIUM_TERM|LONG_TERM
  initialCapital?: number;
}

export interface BacktestTradeDto {
  date?: string;
  tradeDate?: string;
  symbol?: string;
  side?: string;
  orderType?: string;
  price?: number;
  quantity?: number;
  returnPct?: string | number;
  [key: string]: unknown;
}

export interface BacktestRunResult {
  warningMessage?: string;
  cagrPct?: number;
  mddPct?: number;
  sharpeRatio?: number;
  equityCurve?: Array<{ date: string; value: number }>;
  trades?: BacktestTradeDto[];
}

export function runBacktest(request: BacktestRunRequest) {
  return apiFetch<BacktestRunResult>("/api/v1/backtest", {
    method: "POST",
    body: JSON.stringify(request)
  });
}

