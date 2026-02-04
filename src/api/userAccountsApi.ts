import { apiFetch } from "./http";

export interface MainAccountResponseDto {
  accountId: string;
  accountNo: string;
  accountNoMasked: string;
  brokerType: string;
  brokerTypeName: string;
  serverType: string; // "1" | "0"
  serverTypeName: string;
  accountName?: string;
}

export async function getMainAccount(serverType?: "0" | "1") {
  const qs = serverType ? `?serverType=${encodeURIComponent(serverType)}` : "";
  return apiFetch<MainAccountResponseDto>(`/api/v1/user/accounts/main${qs}`, { method: "GET" });
}

