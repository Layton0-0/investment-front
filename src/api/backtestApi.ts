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

/** 로보 어드바이저 백테스트 요청 */
export interface RoboBacktestRequest {
  startDate: string; // yyyy-MM-dd
  endDate: string;
  initialCapital: number;
  assetSymbols?: string[];
  momentumMonths?: number;
  maWindowDays?: number;
  topN?: number;
  rebalanceFrequency?: string;
  commPct?: number;
  slipPct?: number;
}

/** 로보 어드바이저 백테스트 결과 */
export interface RoboBacktestResult {
  startDate?: string;
  endDate?: string;
  initialCapital?: number;
  finalEquity?: number;
  totalReturnPct?: number;
  cagr?: number;
  mddPct?: number;
  sharpeRatio?: number;
  calmarRatio?: number;
  turnover?: number;
  benchmarkCagr?: number;
  benchmarkMddPct?: number;
  equityCurve?: Array<{ date: string; value: number }>;
  benchmarkCurve?: Array<{ date: string; value: number }>;
  rebalanceHistory?: unknown[];
  warningMessage?: string;
}

/** 실행 전 백테스트 최근 결과 */
export interface LastPreExecutionResultDto {
  accountNo: string;
  passed: boolean;
  mddPct?: number;
  sharpeRatio?: number;
  runAt?: string;
}

/** US 일봉 수집 요청/응답 */
export interface CollectUsDailyRequest {
  startDate?: string;
  endDate?: string;
}

export interface CollectUsDailyResponse {
  collectedDays: number;
  savedTotal: number;
  message?: string;
}

export function runBacktest(request: BacktestRunRequest) {
  return apiFetch<BacktestRunResult>("/api/v1/backtest", {
    method: "POST",
    body: JSON.stringify(request)
  });
}

export function runRoboBacktest(request: RoboBacktestRequest): Promise<RoboBacktestResult> {
  return apiFetch<RoboBacktestResult>("/api/v1/backtest/robo", {
    method: "POST",
    body: JSON.stringify(request)
  });
}

/** 로보 리밸런싱 실행 전 백테스트 최근 결과. 204 No Content 시 null */
export async function getLastPreExecution(
  accountNo: string
): Promise<LastPreExecutionResultDto | null> {
  const res = await apiFetch<LastPreExecutionResultDto | undefined>(
    `/api/v1/backtest/robo/last-pre-execution?accountNo=${encodeURIComponent(accountNo)}`,
    { method: "GET" }
  );
  return res ?? null;
}

export function collectUsDaily(
  request?: CollectUsDailyRequest
): Promise<CollectUsDailyResponse> {
  return apiFetch<CollectUsDailyResponse>("/api/v1/backtest/robo/collect-us-daily", {
    method: "POST",
    body: request ? JSON.stringify(request) : undefined
  });
}

