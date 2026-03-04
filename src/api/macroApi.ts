import { apiFetch } from "./http";

/** 시장 레짐 (GET /api/v1/macro/regime) */
export interface RegimeResponseDto {
  regime?: string;
  description?: string;
  confidence?: number;
  riskScore?: number;
}

/** 현재 시장 상태(레짐) 조회. 대시보드 한줄 요약용. */
export function getMarketRegime(): Promise<RegimeResponseDto> {
  return apiFetch<RegimeResponseDto>("/api/v1/macro/regime", { method: "GET" });
}
