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

/** Docker 로컬 풀스택: Nginx → Backend 8080 */
const LOCAL_DOCKER_BACKEND_PORT = 8080;
/** npm run dev(5173) 시 직접 구동 백엔드 포트 (local-agent 등) */
const LOCAL_DIRECT_BACKEND_PORT = 8084;
/** Vite 개발 서버 포트 — 이 포트면 직접 구동 백엔드(8084) 사용 */
const VITE_DEV_SERVER_PORT = "5173";

/**
 * API Base URL 결정 (환경·실행 방식 자동 감지).
 * - VITE_API_BASE_URL 이 있으면 그대로 사용 (명시적 설정 우선).
 * - 없으면: 브라우저가 localhost/127.0.0.1 일 때
 *   - 포트가 5173 (Vite dev) → http://localhost:8084 (직접 구동 백엔드)
 *   - 그 외 (Docker Nginx 등) → http://localhost:8080 (Docker 백엔드)
 * - 그 외 origin → 현재 origin (배포·동일 호스트 API).
 */
function getApiBaseUrl(): string {
  const env = import.meta.env?.VITE_API_BASE_URL;
  if (env !== undefined && env !== "") return env;
  if (typeof window !== "undefined" && window.location?.origin) {
    const hostname = window.location.hostname;
    const port = window.location.port;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const backendPort =
        port === VITE_DEV_SERVER_PORT ? LOCAL_DIRECT_BACKEND_PORT : LOCAL_DOCKER_BACKEND_PORT;
      return `http://${hostname}:${backendPort}`;
    }
    return window.location.origin;
  }
  return `http://localhost:${LOCAL_DOCKER_BACKEND_PORT}`;
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
