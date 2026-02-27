import { apiFetch } from "./http";

/** 백엔드 StrategyDto·StrategyStatus와 정합 */
export type StrategyStatus = "ACTIVE" | "STOPPED" | "PAUSED";
export type StrategyType = "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";

export interface StrategyDto {
  strategyId?: string;
  accountNo: string;
  market?: string;
  strategyType: StrategyType | string;
  status: StrategyStatus;
  maxInvestmentAmount?: number | null;
  minInvestmentAmount?: number | null;
  riskLevel?: number | null;
  confidenceThreshold?: number | null;
  lastExecutedAt?: string | null;
  totalExecutions?: number | null;
  successCount?: number | null;
  failureCount?: number | null;
  totalProfitLoss?: number | null;
  successRate?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** 전략 상태 업데이트 요청 (PUT status) */
export interface StrategyStatusUpdateDto {
  status: StrategyStatus;
}

/** 전략 비교 항목 (백테스트 메트릭) */
export interface StrategyComparisonItemDto {
  market: string;
  strategyType: string;
  description: string;
  cagr: number | null;
  mddPct: number | null;
  sharpeRatio: number | null;
  lastRunAt: string | null;
}

export function getStrategyComparison(market?: "KR" | "US") {
  const qs = market ? `?market=${encodeURIComponent(market)}` : "";
  return apiFetch<StrategyComparisonItemDto[]>(
    `/api/v1/strategies/comparison${qs}`,
    { method: "GET" }
  );
}

/** 표시용: 활성 여부 (status === 'ACTIVE') */
export function isStrategyEnabled(s: StrategyDto): boolean {
  return s.status === "ACTIVE";
}

export function getStrategies(accountNo: string, market?: "KR" | "US") {
  const qs = market ? `?market=${encodeURIComponent(market)}` : "";
  return apiFetch<StrategyDto[]>(
    `/api/v1/strategies/${encodeURIComponent(accountNo)}${qs}`,
    { method: "GET" }
  );
}

export function getStrategy(
  accountNo: string,
  strategyType: string,
  market?: "KR" | "US"
) {
  const qs = market ? `?market=${encodeURIComponent(market)}` : "";
  return apiFetch<StrategyDto>(
    `/api/v1/strategies/${encodeURIComponent(accountNo)}/${encodeURIComponent(strategyType)}${qs}`,
    { method: "GET" }
  );
}

export function createOrUpdateStrategy(dto: StrategyDto) {
  return apiFetch<StrategyDto>("/api/v1/strategies", {
    method: "POST",
    body: JSON.stringify(dto),
    headers: { "Content-Type": "application/json" },
  });
}

export function updateStrategyStatus(
  accountNo: string,
  strategyType: string,
  dto: StrategyStatusUpdateDto,
  market?: "KR" | "US"
) {
  const qs = market ? `?market=${encodeURIComponent(market)}` : "";
  return apiFetch<StrategyDto>(
    `/api/v1/strategies/${encodeURIComponent(accountNo)}/${encodeURIComponent(strategyType)}/status${qs}`,
    {
      method: "PUT",
      body: JSON.stringify(dto),
      headers: { "Content-Type": "application/json" },
    }
  );
}

export function activateStrategy(accountNo: string, strategyType: string, market?: "KR" | "US") {
  const qs = market ? `?market=${encodeURIComponent(market)}` : "";
  return apiFetch<StrategyDto>(
    `/api/v1/strategies/${encodeURIComponent(accountNo)}/${encodeURIComponent(strategyType)}/activate${qs}`,
    { method: "POST" }
  );
}

export function stopStrategy(accountNo: string, strategyType: string, market?: "KR" | "US") {
  const qs = market ? `?market=${encodeURIComponent(market)}` : "";
  return apiFetch<StrategyDto>(
    `/api/v1/strategies/${encodeURIComponent(accountNo)}/${encodeURIComponent(strategyType)}/stop${qs}`,
    { method: "POST" }
  );
}
