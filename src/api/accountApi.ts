import { apiFetch } from "./http";

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

export function getAccountAssets(accountNo: string) {
  return apiFetch<AccountAssetDto>(`/api/v1/accounts/${encodeURIComponent(accountNo)}/assets`, {
    method: "GET"
  });
}

export function getPositions(accountNo: string) {
  return apiFetch<AccountPositionDto[]>(
    `/api/v1/accounts/${encodeURIComponent(accountNo)}/positions`,
    { method: "GET" }
  );
}

