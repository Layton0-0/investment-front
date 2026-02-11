import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { analyze, type AnalysisRequestDto } from "./analysisApi";

describe("analysisApi", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          symbol: "005930",
          recommendation: "HOLD",
          confidence: 0.7,
          targetPrice: 75000,
          currentPrice: 72000,
          expectedReturn: 4.2,
          analyzedAt: "2026-02-10T00:00:00",
        }),
        { status: 200, headers: { "content-type": "application/json" } } as ResponseInit
      ) as Response;
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("analyze calls POST /api/v1/analysis with request body", async () => {
    const request: AnalysisRequestDto = { symbol: "005930", periodDays: 14 };
    await analyze(request);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/analysis"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(request),
      })
    );
  });

  it("analyze with optional indicators sends them in body", async () => {
    await analyze({ symbol: "AAPL", periodDays: 30, indicators: ["RSI", "MACD"] });
    const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.indicators).toEqual(["RSI", "MACD"]);
  });
});
