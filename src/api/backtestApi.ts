import { apiFetch } from "./http";

export interface BacktestRunRequest {
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  market?: string; // KR|US
  strategyType?: string; // SHORT_TERM|MEDIUM_TERM|LONG_TERM
  initialCapital?: number;
}

export interface BacktestRunResult {
  warningMessage?: string;
  cagrPct?: number;
  mddPct?: number;
  sharpeRatio?: number;
  equityCurve?: Array<{ date: string; value: number }>;
  trades?: any[];
}

export function runBacktest(request: BacktestRunRequest) {
  return apiFetch<BacktestRunResult>("/api/v1/backtest", {
    method: "POST",
    body: JSON.stringify(request)
  });
}

