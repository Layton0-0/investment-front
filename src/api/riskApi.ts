import { apiFetch } from "./http";

/** 계좌별 리스크 요약 (GET /api/v1/risk/summary 내 accounts 항목) */
export interface RiskAccountSummaryDto {
  accountNoMasked?: string;
  serverType?: string;
  openingBalance?: number;
  currentValue?: number;
  newBuyBlockedByDailyLoss?: boolean;
  mdd?: number;
  peakValue?: number;
}

/** 리스크 요약 (GET /api/v1/risk/summary) */
export interface RiskSummaryDto {
  killSwitchActive: boolean;
  regimeGateEnabled: boolean;
  riskGateAllowsNewBuy: boolean;
  riskGateSizeMultiplier?: number;
  accounts: RiskAccountSummaryDto[];
  /** 계좌 합산 현재 평가액 (노출 합계) */
  totalCurrentValue?: number;
  /** 계좌 중 최대 MDD (0~1) */
  maxMddPct?: number;
  /** 1일 VaR 95% (%, 포트폴리오 대비 손실 가능 비율) */
  var95Pct?: number;
  /** 1일 CVaR 95% (%, Expected Shortfall) */
  cvar95Pct?: number;
  /** Sharpe 비율 (연율화). 데이터 없으면 null */
  sharpeRatio?: number | null;
  /** Sortino 비율 (연율화). 데이터 없으면 null */
  sortinoRatio?: number | null;
}

/** 포트폴리오(단일 계좌) 리스크 메트릭 (GET /api/v1/risk/portfolio-metrics) */
export interface PortfolioRiskMetricsDto {
  accountNoMasked?: string;
  currentValue?: number;
  mddPct?: number;
  var95Pct?: number;
  cvar95Pct?: number;
  sharpeRatio?: number | null;
  sortinoRatio?: number | null;
}

/** 리스크 한도 설정 (GET /api/v1/risk/limits) */
export interface RiskLimitsDto {
  regimeGateEnabled: boolean;
  vixThreshold?: number;
  reduceSizeOnHighVolPct?: number;
  dailyLossLimitPct?: number;
}

/** 리스크 이력 항목 (GET /api/v1/risk/history) */
export interface RiskHistoryItemDto {
  eventType?: string;
  accountNoMasked?: string;
  description?: string;
  occurredAt?: string;
}

export function getRiskSummary(): Promise<RiskSummaryDto> {
  return apiFetch<RiskSummaryDto>("/api/v1/risk/summary", { method: "GET" });
}

export function getRiskLimits(): Promise<RiskLimitsDto> {
  return apiFetch<RiskLimitsDto>("/api/v1/risk/limits", { method: "GET" });
}

export function getRiskHistory(params?: {
  from?: string;
  to?: string;
}): Promise<RiskHistoryItemDto[]> {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const qs = search.toString();
  return apiFetch<RiskHistoryItemDto[]>(
    `/api/v1/risk/history${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

export function getPortfolioRiskMetrics(accountNo: string): Promise<PortfolioRiskMetricsDto> {
  return apiFetch<PortfolioRiskMetricsDto>(
    `/api/v1/risk/portfolio-metrics?accountNo=${encodeURIComponent(accountNo)}`,
    { method: "GET" }
  );
}
