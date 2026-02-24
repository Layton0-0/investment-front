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
  /** 파이프라인 자동 실행 허용. null = 서버 기본값 */
  pipelineAutoExecute?: boolean | null;
  /** 실계좌 자동 실행 허용. null = 서버 기본값 (실계좌 탭에서만 의미 있음) */
  pipelineAllowRealExecution?: boolean | null;
}

export function getSettingsAccounts() {
  return apiFetch<SettingsAccountsResponseDto>("/api/v1/settings/accounts", { method: "GET" });
}

/** 계좌별 거래 설정 조회. 설정 없으면 백엔드가 204 No Content → null 반환. */
export async function getSettingByAccountNo(
  accountNo: string
): Promise<TradingSettingDto | null> {
  try {
    const result = await apiFetch<TradingSettingDto | undefined>(
      `/api/v1/settings/${encodeURIComponent(accountNo)}`,
      { method: "GET" }
    );
    return result ?? null;
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

/** 계좌별 거래 설정 저장 (자동투자 ON/OFF, 비율, 최대투자금 등). */
export function updateSetting(
  accountNo: string,
  body: TradingSettingDto
): Promise<TradingSettingDto> {
  return apiFetch<TradingSettingDto>(
    `/api/v1/settings/${encodeURIComponent(accountNo)}`,
    { method: "PUT", body: JSON.stringify(body) }
  );
}

