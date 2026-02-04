import { apiFetch } from "./http";

export interface SignalScoreDto {
  basDt: string;
  market: string;
  symbol: string;
  factorType: string;
  score: number;
  rank?: number;
}

export interface SignalScorePageResponseDto {
  content: SignalScoreDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export function getSignals(params: {
  basDt?: string;
  market?: string;
  symbol?: string;
  factorType?: string;
  page?: number;
  size?: number;
}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<SignalScorePageResponseDto>(`/api/v1/signals${suffix}`, { method: "GET" });
}

