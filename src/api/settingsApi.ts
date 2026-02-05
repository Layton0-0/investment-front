import { ApiError, apiFetch } from "./http";

export interface SettingsAccountBlockDto {
  serverType: string; // "1" | "0"
  serverTypeName?: string;
  brokerType?: string;
  brokerTypeName?: string;
  accountNoMasked?: string;
  appKeyMasked?: string;
  hasAccount?: boolean;
}

export interface SettingsAccountsResponseDto {
  virtual?: SettingsAccountBlockDto;
  real?: SettingsAccountBlockDto;
}

export interface SettingsAccountsUpdateRequestDto {
  currentPassword?: string;
  virtual?: {
    brokerType?: string;
    accountNo?: string;
    appKey?: string;
    appSecret?: string;
  };
  real?: {
    brokerType?: string;
    accountNo?: string;
    appKey?: string;
    appSecret?: string;
  };
}

/** 거래 설정 DTO (GET /api/v1/settings/{accountNo}) */
export interface TradingSettingDto {
  maxInvestmentAmount?: number | string;
  minInvestmentAmount?: number | string;
  defaultCurrency?: string;
  autoTradingEnabled?: boolean;
  roboAdvisorEnabled?: boolean;
  riskLevel?: number;
  shortTermRatio?: number;
  mediumTermRatio?: number;
  longTermRatio?: number;
}

export function getSettingsAccounts() {
  return apiFetch<SettingsAccountsResponseDto>("/api/v1/settings/accounts", { method: "GET" });
}

/** 계좌별 거래 설정 조회. 404/400(설정 없음) 시 null 반환. */
export async function getSettingByAccountNo(
  accountNo: string
): Promise<TradingSettingDto | null> {
  try {
    return await apiFetch<TradingSettingDto>(
      `/api/v1/settings/${encodeURIComponent(accountNo)}`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
      return null;
    }
    throw e;
  }
}

export function updateSettingsAccounts(request: SettingsAccountsUpdateRequestDto) {
  return apiFetch<SettingsAccountsResponseDto>("/api/v1/settings/accounts", {
    method: "PUT",
    body: JSON.stringify(request)
  });
}

