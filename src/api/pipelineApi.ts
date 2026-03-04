import { ApiError, apiFetch } from "./http";
import type { SignalScoreDto } from "./signalsApi";

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
  /** 현재가 (백엔드 보강 시) */
  currentPrice?: number | null;
  /** 손익률 % (백엔드 보강 시) */
  pnlPercent?: number | null;
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
  /** 3단계 자금 배분 비율 문자열 (예: 단기 40% / 중기 35% / 장기 25%) */
  allocationRatioSummary?: string;
  /** 2단계 시그널 목록 KR (summary 한 번에 내려옴) */
  signalListKr?: SignalScoreDto[];
  /** 2단계 시그널 목록 US */
  signalListUs?: SignalScoreDto[];
  openPositionList?: OpenPositionItemDto[];
  /** 파이프라인 마지막 실행 시각 (ISO 8601). 없으면 null */
  lastRunAt?: string | null;
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

