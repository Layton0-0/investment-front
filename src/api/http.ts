/** Error response body from API (4xx/5xx JSON). */
export interface ApiErrorBody {
  message?: string;
  error?: string;
  code?: string;
  details?: string[];
  traceId?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: string[];
  readonly traceId?: string;

  constructor(
    message: string,
    status: number,
    options?: { code?: string; details?: string[]; traceId?: string }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
    this.traceId = options?.traceId;
  }
}

/** 기본 백엔드 포트 8083 (8084는 Agent/테스트용). */
const DEFAULT_API_BASE_URL = "http://localhost:8083";

function getApiBaseUrl(): string {
  const env = import.meta.env?.VITE_API_BASE_URL;
  if (env !== undefined && env !== "") return env;
  return DEFAULT_API_BASE_URL;
}

/** Called on 401 (e.g. JWT invalid/expired). Set by app to logout + redirect to login. */
let onUnauthorized: (() => void) | undefined;

export function setUnauthorizedHandler(handler: (() => void) | undefined) {
  onUnauthorized = handler;
}

function handleUnauthorized() {
  if (typeof onUnauthorized === "function") {
    onUnauthorized();
  } else {
    const base = import.meta.env?.VITE_BASE_URL ?? "";
    window.location.href = `${base}/login`.replace(/\/+/g, "/");
  }
}

export interface ApiFetchInit extends RequestInit {
  skipAuth?: boolean;
  skipUnauthorizedHandler?: boolean;
}

export async function apiFetch<T>(path: string, init: ApiFetchInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const isAuthRequest = !init.skipAuth;

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include"
  });

  const isJson = (res.headers.get("content-type") || "").includes("application/json");

  if (!res.ok) {
    const skipHandler = !!init.skipUnauthorizedHandler;
    if (res.status === 401 && isAuthRequest && !skipHandler) {
      handleUnauthorized();
    }
    let message = `Request failed (${res.status})`;
    let code: string | undefined;
    let details: string[] | undefined;
    let traceId: string | undefined;
    if (isJson) {
      try {
        const body = (await res.json()) as ApiErrorBody;
        message = body?.message ?? body?.error ?? message;
        code = body?.code;
        details = Array.isArray(body?.details) ? body.details : undefined;
        traceId = body?.traceId;
      } catch {
        // ignore
      }
    }
    throw new ApiError(message, res.status, { code, details, traceId });
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  if (isJson) {
    return (await res.json()) as T;
  }

  // fallback: treat as text
  return (await res.text()) as unknown as T;
}
