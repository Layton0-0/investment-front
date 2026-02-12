import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getGovernanceResults,
  getGovernanceHalts,
  clearGovernanceHalt,
} from "./opsApi";

describe("opsApi governance", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("getGovernanceResults calls GET with limit query (default 20)", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    await getGovernanceResults();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/ops\/governance\/results\?limit=20$/),
      expect.objectContaining({ method: "GET" })
    );
  });

  it("getGovernanceResults accepts custom limit and caps to 1-500", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    await getGovernanceResults({ limit: 50 });
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toContain("limit=50");
  });

  it("getGovernanceHalts calls GET /api/v1/ops/governance/halts", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    await getGovernanceHalts();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/ops/governance/halts"),
      expect.objectContaining({ method: "GET" })
    );
  });

  it("clearGovernanceHalt calls PUT with path params and optional body", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(undefined, { status: 204 })
    );
    await clearGovernanceHalt("KR", "SHORT_TERM");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/ops/governance/halts/KR/SHORT_TERM/clear"),
      expect.objectContaining({ method: "PUT" })
    );

    vi.clearAllMocks();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(undefined, { status: 204 })
    );
    await clearGovernanceHalt("US", "MEDIUM_TERM", "admin1");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/ops/governance/halts/US/MEDIUM_TERM/clear"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ clearedBy: "admin1" }),
      })
    );
  });
});
