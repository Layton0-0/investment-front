import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getStrategies,
  getStrategy,
  createOrUpdateStrategy,
  updateStrategyStatus,
  isStrategyEnabled,
  type StrategyDto,
} from "./strategyApi";

describe("strategyApi", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(JSON.stringify({ accountNo: "123", strategyType: "SHORT_TERM", status: "ACTIVE" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      } as ResponseInit) as Response;
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("getStrategies calls GET /api/v1/strategies/{accountNo} with optional market", async () => {
    await getStrategies("12345678");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/strategies/12345678"),
      expect.objectContaining({ method: "GET" })
    );
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).not.toContain("market=");

    vi.clearAllMocks();
    await getStrategies("12345678", "KR");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/strategies\/12345678\?market=KR/),
      expect.any(Object)
    );
  });

  it("getStrategy calls GET /api/v1/strategies/{accountNo}/{strategyType}", async () => {
    await getStrategy("12345678", "SHORT_TERM", "US");
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toContain("/api/v1/strategies/12345678/SHORT_TERM");
    expect(url).toContain("market=US");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "GET" })
    );
  });

  it("createOrUpdateStrategy calls POST /api/v1/strategies with body", async () => {
    const dto: StrategyDto = {
      accountNo: "123",
      market: "KR",
      strategyType: "SHORT_TERM",
      status: "STOPPED",
    };
    await createOrUpdateStrategy(dto);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/strategies"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(dto),
      })
    );
  });

  it("updateStrategyStatus calls PUT .../status with body", async () => {
    await updateStrategyStatus("12345678", "MEDIUM_TERM", { status: "PAUSED" }, "KR");
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toContain("/api/v1/strategies/12345678/MEDIUM_TERM/status");
    expect(url).toContain("market=KR");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ status: "PAUSED" }),
      })
    );
  });

  it("isStrategyEnabled returns true only for ACTIVE", () => {
    expect(isStrategyEnabled({ accountNo: "1", strategyType: "SHORT_TERM", status: "ACTIVE" })).toBe(true);
    expect(isStrategyEnabled({ accountNo: "1", strategyType: "SHORT_TERM", status: "STOPPED" })).toBe(false);
    expect(isStrategyEnabled({ accountNo: "1", strategyType: "SHORT_TERM", status: "PAUSED" })).toBe(false);
  });
});
