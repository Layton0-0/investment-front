import { apiFetch } from "./http";

export interface PipelineSummaryDto {
  basDt?: string;
  accountNo: string;
  universeCountKr?: number;
  universeCountUs?: number;
  signalCountKr?: number;
  signalCountUs?: number;
  openPositionCount?: number;
  allocationSummary?: string;
}

export function getPipelineSummary(accountNo: string, basDt?: string) {
  const qs = new URLSearchParams();
  qs.set("accountNo", accountNo);
  if (basDt) qs.set("basDt", basDt);
  return apiFetch<PipelineSummaryDto>(`/api/v1/pipeline/summary?${qs.toString()}`, { method: "GET" });
}

