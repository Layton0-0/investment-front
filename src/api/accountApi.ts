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

/** 보유 종목 조회. 404 시 빈 배열 반환. */
export async function getPositions(
  accountNo: string
): Promise<AccountPositionDto[]> {
  try {
    return await apiFetch<AccountPositionDto[]>(
      `/api/v1/accounts/${encodeURIComponent(accountNo)}/positions`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return [];
    }
    throw e;
  }
}

