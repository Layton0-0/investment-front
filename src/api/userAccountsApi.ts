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

