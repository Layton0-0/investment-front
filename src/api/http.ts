export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function getApiBaseUrl() {
  return (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8083";
}

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

export function storeAccessToken(token: string | null) {
  try {
    if (!token) localStorage.removeItem("accessToken");
    else localStorage.setItem("accessToken", token);
  } catch {
    // ignore (e.g., private mode)
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!init.skipAuth) {
    const token = getStoredAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...init,
    headers
  });

  const isJson = (res.headers.get("content-type") || "").includes("application/json");

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    if (isJson) {
      try {
        const body: any = await res.json();
        message = body?.message || body?.error || message;
      } catch {
        // ignore
      }
    }
    throw new ApiError(message, res.status);
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

