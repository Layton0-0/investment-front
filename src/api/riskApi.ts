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
