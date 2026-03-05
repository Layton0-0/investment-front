import { ApiError, apiFetch } from "./http";

export interface AccountAssetDto {
  accountNo: string;
  totalAssetValue: string;
  deposit: string;
  stockValue: string;
  totalProfitLoss: string;
  totalProfitLossRate: string;
  orderableCash: string;
  currency: string;
}

export interface AccountPositionDto {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: string;
  currentPrice: string;
  totalValue: string;
  profitLoss: string;
  profitLossRate: string;
  currency: string;
  market?: string;
}

/** 자산 현황 조회. 404/400(계좌 없음 등) 시 null 반환. */
export async function getAccountAssets(
  accountNo: string
): Promise<AccountAssetDto | null> {
  try {
    return await apiFetch<AccountAssetDto>(
      `/api/v1/accounts/${encodeURIComponent(accountNo)}/assets`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
      return null;
    }
    throw e;
  }
}

export interface OverseasBalanceSummaryDto {
  deposit?: number;
  totalAsset?: number;
  totalProfitLoss?: number;
  totalProfitLossRate?: number;
  currency?: string;
}

/** 해외(미국) 계좌 요약 — 예수금·총자산. 대시보드 US 계좌 카드용. 404 시 null. */
export async function getOverseasSummary(
  accountNo: string
): Promise<OverseasBalanceSummaryDto | null> {
  try {
    return await apiFetch<OverseasBalanceSummaryDto>(
      `/api/v1/accounts/${encodeURIComponent(accountNo)}/overseas-summary`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) return null;
    throw e;
  }
}

/** 보유 종목 조회. market=KR(국내만), market=US(해외만), 미지정 시 국내+해외 병합. 404 시 빈 배열 반환. */
export async function getPositions(
  accountNo: string,
  market?: "KR" | "US"
): Promise<AccountPositionDto[]> {
  try {
    const path = `/api/v1/accounts/${encodeURIComponent(accountNo)}/positions${market ? `?market=${encodeURIComponent(market)}` : ""}`;
    return await apiFetch<AccountPositionDto[]>(path, { method: "GET" });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return [];
    }
    throw e;
  }
}

export interface AccountBalanceDto {
  totalBalance?: string;
  totalAssetValue?: string;
  orderableCash?: string;
  [key: string]: unknown;
}

/** 잔고 조회. 404 시 null. */
export async function getBalance(accountNo: string): Promise<AccountBalanceDto | null> {
  try {
    return await apiFetch<AccountBalanceDto>(
      `/api/v1/accounts/${encodeURIComponent(accountNo)}/balance`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) return null;
    throw e;
  }
}

export interface BuyableAmountDto {
  buyableAmount?: string;
  buyableQuantity?: string;
  [key: string]: unknown;
}

/** 매수가능조회. symbol, price 필요. */
export async function getBuyableAmount(
  accountNo: string,
  symbol: string,
  price: number | string
): Promise<BuyableAmountDto | null> {
  try {
    return await apiFetch<BuyableAmountDto>(
      `/api/v1/accounts/${encodeURIComponent(accountNo)}/buyable-amount?symbol=${encodeURIComponent(symbol)}&price=${encodeURIComponent(String(price))}`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) return null;
    throw e;
  }
}

export interface SellableQuantityDto {
  sellableQuantity?: string;
  [key: string]: unknown;
}

/** 매도가능수량조회. */
export async function getSellableQuantity(
  accountNo: string,
  symbol: string
): Promise<SellableQuantityDto | null> {
  try {
    return await apiFetch<SellableQuantityDto>(
      `/api/v1/accounts/${encodeURIComponent(accountNo)}/sellable-quantity?symbol=${encodeURIComponent(symbol)}`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) return null;
    throw e;
  }
}

export interface OrderHistoryItemDto {
  orderTime?: string;
  symbol?: string;
  orderType?: string;
  quantity?: number;
  price?: string;
  status?: string;
  [key: string]: unknown;
}

/** 주문체결조회. startDate, endDate (yyyy-MM-dd). */
export async function getOrderHistory(
  accountNo: string,
  startDate: string,
  endDate: string
): Promise<OrderHistoryItemDto[]> {
  try {
    return await apiFetch<OrderHistoryItemDto[]>(
      `/api/v1/accounts/${encodeURIComponent(accountNo)}/order-history?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return [];
    throw e;
  }
}

export interface ProfitLossDto {
  totalProfitLoss?: string;
  totalProfitLossRate?: string;
  [key: string]: unknown;
}

/** 기간별손익조회. 404/계좌 없음 시 null. 400 + code=API_NOT_SUPPORTED(모의 미지원) 시 예외 유지해 호출처에서 "모의계좌 미지원" 표기 가능. */
export async function getProfitLoss(
  accountNo: string,
  startDate: string,
  endDate: string
): Promise<ProfitLossDto | null> {
  try {
    return await apiFetch<ProfitLossDto>(
      `/api/v1/accounts/${encodeURIComponent(accountNo)}/profit-loss?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 400 && e.code === "API_NOT_SUPPORTED") throw e;
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) return null;
    throw e;
  }
}

