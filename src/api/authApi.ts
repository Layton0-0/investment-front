import { apiFetch } from "./http";

export interface AuthResponseDto {
  token: string;
  userId: string;
  username: string;
  message?: string;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface SignupRequestDto {
  username: string;
  password: string;
  brokerType: string;
  appKey: string;
  appSecret: string;
  serverType: "0" | "1";
  accountNo: string; // "12345678-12"
  preIssuedAccessToken?: string;
}

export interface AccountVerifyRequestDto {
  brokerType: string;
  appKey: string;
  appSecret: string;
  serverType: "0" | "1";
  accountNo: string; // "12345678-12"
}

export interface AccountVerifyResponseDto {
  success: boolean;
  message?: string;
  accessToken?: string;
}

export interface MyPageResponseDto {
  userId: string;
  username: string;
  brokerType?: string;
  accountNo?: string;
  serverType?: string;
}

export function login(request: LoginRequestDto) {
  return apiFetch<AuthResponseDto>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuth: true
  });
}

export function signup(request: SignupRequestDto) {
  return apiFetch<AuthResponseDto>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuth: true
  });
}

export function verifyAccount(request: AccountVerifyRequestDto) {
  return apiFetch<AccountVerifyResponseDto>("/api/v1/auth/verify-account", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuth: true
  });
}

export function getMyPage(init?: { skipUnauthorizedHandler?: boolean }) {
  return apiFetch<MyPageResponseDto>("/api/v1/auth/mypage", {
    method: "GET",
    ...init
  });
}

export function logout() {
  return apiFetch<void>("/api/v1/auth/logout", {
    method: "POST"
  });
}

