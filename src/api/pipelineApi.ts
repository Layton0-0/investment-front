import { ApiError, apiFetch } from "./http";

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

/** 파이프라인 요약 조회. 404/실패 시 null 반환. */
export async function getPipelineSummary(
  accountNo: string,
  basDt?: string
): Promise<PipelineSummaryDto | null> {
  try {
    const qs = new URLSearchParams();
    qs.set("accountNo", accountNo);
    if (basDt) qs.set("basDt", basDt);
    return await apiFetch<PipelineSummaryDto>(
      `/api/v1/pipeline/summary?${qs.toString()}`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
      return null;
    }
    throw e;
  }
}

