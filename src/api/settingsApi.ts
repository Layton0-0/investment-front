import { apiFetch } from "./http";

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

export function getSettingsAccounts() {
  return apiFetch<SettingsAccountsResponseDto>("/api/v1/settings/accounts", { method: "GET" });
}

export function updateSettingsAccounts(request: SettingsAccountsUpdateRequestDto) {
  return apiFetch<SettingsAccountsResponseDto>("/api/v1/settings/accounts", {
    method: "PUT",
    body: JSON.stringify(request)
  });
}

