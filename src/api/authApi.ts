import { apiFetch } from "./http";

export interface AuthResponseDto {
  token: string;
  userId: string;
  username: string;
  role?: string;
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
  role?: string;
  brokerType?: string;
  accountNo?: string;
  serverType?: string;
}

/** 마이페이지 수정 요청 (비밀번호·API 키 등). 변경하지 않을 필드는 생략 */
export interface MyPageUpdateRequestDto {
  currentPassword?: string;
  password?: string;
  brokerType?: string;
  appKey?: string;
  appSecret?: string;
  serverType?: string;
  accountNo?: string;
}

export function getMyPage(init?: { skipUnauthorizedHandler?: boolean }) {
  return apiFetch<MyPageResponseDto>("/api/v1/auth/mypage", {
    method: "GET",
    ...init
  });
}

export function updateMyPage(request: MyPageUpdateRequestDto) {
  return apiFetch<MyPageResponseDto>("/api/v1/auth/mypage", {
    method: "PUT",
    body: JSON.stringify(request)
  });
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

export function logout() {
  return apiFetch<void>("/api/v1/auth/logout", {
    method: "POST"
  });
}

