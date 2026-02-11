import { ApiError, apiFetch } from "./http";

/** 보유 포지션 1건 (자동투자 현황 4단계) */
export interface OpenPositionItemDto {
  positionId?: number;
  symbol: string;
  market?: string;
  quantity: number;
  entryPrice: string | number;
  entryDt?: string;
  /** 거래 사유: 진입 시그널 유형 */
  signalType?: string | null;
  /** 거래 사유: 청산 규칙 유형 */
  exitRuleType?: string | null;
}

export interface PipelineSummaryDto {
  basDt?: string;
  accountNo: string;
  universeCountKr?: number;
  universeCountUs?: number;
  signalCountKr?: number;
  signalCountUs?: number;
  openPositionCount?: number;
  allocationSummary?: string;
  openPositionList?: OpenPositionItemDto[];
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

