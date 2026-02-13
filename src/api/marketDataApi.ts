import { apiFetch } from "./http";

export interface CurrentPriceDto {
  symbol?: string;
  name?: string;
  currentPrice?: number;
  changeRate?: number;
  changeAmount?: number;
  previousClose?: number;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  volume?: number;
  tradingValue?: number;
  marketCap?: number;
  listedShares?: number;
  queriedAt?: string;
}

export function getCurrentPrice(symbol: string) {
  return apiFetch<CurrentPriceDto>(
    `/api/v1/market-data/current-price/${encodeURIComponent(symbol)}`,
    { method: "GET" }
  );
}

/**
 * 여러 종목 현재가 일괄 조회. 백엔드는 body에 문자열 배열을 받음.
 */
export function getCurrentPrices(symbols: string[]) {
  return apiFetch<CurrentPriceDto[]>("/api/v1/market-data/current-prices", {
    method: "POST",
    body: JSON.stringify(symbols),
    headers: { "Content-Type": "application/json" },
  });
}

/** 일봉 차트 한 건 (TB_DAILY_STOCK 기반) */
export interface DailyChartPointDto {
  date?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

/**
 * 종목·시장·기간별 일봉 차트 데이터. 대시보드·포트폴리오 차트용. 최대 365일.
 */
export function getDailyChart(
  symbol: string,
  market: string,
  from?: string,
  to?: string
) {
  const params = new URLSearchParams({ symbol, market });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return apiFetch<DailyChartPointDto[]>(
    `/api/v1/market-data/daily-chart?${params.toString()}`,
    { method: "GET" }
  );
}
