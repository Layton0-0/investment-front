import { apiFetch } from "./http";

export interface AnalysisRequestDto {
  symbol: string;
  periodDays: number;
  indicators?: string[] | null;
}

export interface AnalysisIndicatorDto {
  name?: string;
  value?: string;
  interpretation?: string;
}

export interface AnalysisResponseDto {
  symbol: string;
  recommendation: string;
  confidence: number;
  targetPrice: number;
  currentPrice: number;
  expectedReturn: number;
  indicators?: AnalysisIndicatorDto[] | null;
  analyzedAt: string;
  reasoning?: string | null;
}

export function analyze(request: AnalysisRequestDto) {
  return apiFetch<AnalysisResponseDto>("/api/v1/analysis", {
    method: "POST",
    body: JSON.stringify(request),
    headers: { "Content-Type": "application/json" },
  });
}

/** 섹터 분석 응답 (GET /api/v1/analysis/sector) */
export interface SectorWeightItemDto {
  sectorCode?: string;
  sectorName?: string;
  weightPct?: number;
  notionalValue?: number;
  returnPct?: number;
}

export interface SectorAnalysisResponseDto {
  market?: string;
  totalValue?: number;
  sectors?: SectorWeightItemDto[];
}

/** 계좌 또는 종목 목록 기준 섹터 분석. accountNo 있으면 계좌 포지션 기준, 없으면 symbols+market(선택) */
export function getSectorAnalysis(params?: {
  accountNo?: string;
  symbols?: string;
  market?: string;
}): Promise<SectorAnalysisResponseDto> {
  const search = new URLSearchParams();
  if (params?.accountNo) search.set("accountNo", params.accountNo);
  if (params?.symbols) search.set("symbols", params.symbols);
  if (params?.market) search.set("market", params.market);
  const qs = search.toString();
  return apiFetch<SectorAnalysisResponseDto>(`/api/v1/analysis/sector${qs ? `?${qs}` : ""}`, { method: "GET" });
}

/** 상관관계 분석 응답 (GET /api/v1/analysis/correlation). matrix[i][j] = symbols[i] vs symbols[j] 상관계수 */
export interface CorrelationAnalysisResponseDto {
  market?: string;
  symbols?: string[];
  fromDate?: string;
  toDate?: string;
  matrix?: number[][];
}

/** 계좌 또는 종목 목록 기준 상관관계 분석. accountNo 있으면 계좌 포지션 기준, 없으면 symbols+market+from+to */
export function getCorrelationAnalysis(params?: {
  accountNo?: string;
  symbols?: string;
  market?: string;
  from?: string;
  to?: string;
}): Promise<CorrelationAnalysisResponseDto> {
  const search = new URLSearchParams();
  if (params?.accountNo) search.set("accountNo", params.accountNo);
  if (params?.symbols) search.set("symbols", params.symbols);
  if (params?.market) search.set("market", params.market ?? "US");
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const qs = search.toString();
  return apiFetch<CorrelationAnalysisResponseDto>(`/api/v1/analysis/correlation${qs ? `?${qs}` : ""}`, { method: "GET" });
}
