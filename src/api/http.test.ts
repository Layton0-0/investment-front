import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { apiFetch, storeAccessToken } from "./http";

describe("apiFetch", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    storeAccessToken("test-token");
    globalThis.fetch = vi.fn(async (input: any, init: any) => {
      return new Response(
        JSON.stringify({ ok: true }),
        {
          status: 200,
          headers: { "content-type": "application/json" }
        } as any
      ) as any;
    }) as any;
  });

  afterEach(() => {
    storeAccessToken(null);
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("adds Authorization header when token exists", async () => {
    await apiFetch("/api/v1/health", { method: "GET" } as any);
    expect(globalThis.fetch).toHaveBeenCalled();
    const [, init] = (globalThis.fetch as any).mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("does not add Authorization header when skipAuth is true", async () => {
    await apiFetch("/api/v1/auth/login", { method: "POST", skipAuth: true } as any);
    const [, init] = (globalThis.fetch as any).mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBeNull();
  });
});

