import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { apiFetch } from "./http";

describe("apiFetch", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" }
      } as ResponseInit) as Response;
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("sends credentials include and does not set Authorization header", async () => {
    await apiFetch("/api/v1/health", { method: "GET" });
    expect(globalThis.fetch).toHaveBeenCalled();
    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init?.credentials).toBe("include");
    const headers = new Headers(init?.headers ?? {});
    expect(headers.get("Authorization")).toBeNull();
  });

  it("does not add Authorization header when skipAuth is true", async () => {
    await apiFetch("/api/v1/auth/login", { method: "POST", skipAuth: true, body: "{}" });
    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = new Headers(init?.headers ?? {});
    expect(headers.get("Authorization")).toBeNull();
  });
});
