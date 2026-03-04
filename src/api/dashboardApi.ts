import { apiFetch } from "./http";

/** 대시보드 성과 요약 (GET /api/v1/dashboard/performance-summary) */
export interface DashboardPerformanceSummaryDto {
  totalCurrentValue?: number;
  maxMddPct?: number;
  sharpeRatio?: number | null;
  sortinoRatio?: number | null;
  var95Pct?: number | null;
  cvar95Pct?: number | null;
  /** 당일 손익 합계 (원). 없으면 null */
  dailyProfitLoss?: number | null;
  /** 리스크 수준: 낮음 | 중간 | 높음 */
  riskLevel?: string | null;
}

/** 대시보드 카드용 성과 요약 조회 */
export function getPerformanceSummary(): Promise<DashboardPerformanceSummaryDto> {
  return apiFetch<DashboardPerformanceSummaryDto>("/api/v1/dashboard/performance-summary", {
    method: "GET",
  });
}
