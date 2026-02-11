import { ApiError, apiFetch } from "./http";

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

export interface UserAccountDto {
  accountId: string;
  accountNoMasked?: string;
  brokerType?: string;
  brokerTypeName?: string;
  serverType?: string;
  serverTypeName?: string;
  accountName?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface AccountListResponseDto {
  accounts: UserAccountDto[];
  mainAccountId?: string;
  totalCount?: number;
}

/** 메인 계좌 조회. 404(계좌 없음) 시 null 반환. */
export async function getMainAccount(
  serverType?: "0" | "1"
): Promise<MainAccountResponseDto | null> {
  const qs = serverType ? `?serverType=${encodeURIComponent(serverType)}` : "";
  try {
    return await apiFetch<MainAccountResponseDto>(
      `/api/v1/user/accounts/main${qs}`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
      return null;
    }
    throw e;
  }
}

/** 계좌 목록 조회. serverType 미지정 시 전체. */
export function getAccounts(serverType?: "0" | "1"): Promise<AccountListResponseDto> {
  const qs = serverType != null ? `?serverType=${encodeURIComponent(serverType)}` : "";
  return apiFetch<AccountListResponseDto>(`/api/v1/user/accounts${qs}`, { method: "GET" });
}

/** 특정 계좌 조회 (accountId). 404 시 null. */
export async function getAccount(accountId: string): Promise<MainAccountResponseDto | null> {
  try {
    return await apiFetch<MainAccountResponseDto>(
      `/api/v1/user/accounts/${encodeURIComponent(accountId)}`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** 메인 계좌로 설정. */
export function setMainAccount(accountId: string): Promise<void> {
  return apiFetch<void>(
    `/api/v1/user/accounts/${encodeURIComponent(accountId)}/main`,
    { method: "PUT" }
  );
}

