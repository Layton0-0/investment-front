import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getCurrentPrice, getCurrentPrices } from "./marketDataApi";

describe("marketDataApi", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(
        JSON.stringify({ symbol: "005930", currentPrice: 72000 }),
        { status: 200, headers: { "content-type": "application/json" } } as ResponseInit
      ) as Response;
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("getCurrentPrice calls GET /api/v1/market-data/current-price/{symbol}", async () => {
    await getCurrentPrice("005930");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/market-data/current-price/005930"),
      expect.objectContaining({ method: "GET" })
    );
  });

  it("getCurrentPrice encodes symbol in URL", async () => {
    await getCurrentPrice("AAPL");
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toContain("AAPL");
  });

  it("getCurrentPrices calls POST /api/v1/market-data/current-prices with array body", async () => {
    await getCurrentPrices(["005930", "000660"]);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/market-data/current-prices"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(["005930", "000660"]),
      })
    );
  });
});
