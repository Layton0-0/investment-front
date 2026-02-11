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
