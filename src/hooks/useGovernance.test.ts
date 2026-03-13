import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGovernance } from "./useGovernance";

vi.mock("@/api/opsApi", () => ({
  getGovernanceResults: vi.fn(),
  getGovernanceHalts: vi.fn(),
  getGovernanceStatus: vi.fn(),
}));

import {
  getGovernanceResults,
  getGovernanceHalts,
  getGovernanceStatus,
} from "@/api/opsApi";

const mockGetGovernanceResults = vi.mocked(getGovernanceResults);
const mockGetGovernanceHalts = vi.mocked(getGovernanceHalts);
const mockGetGovernanceStatus = vi.mocked(getGovernanceStatus);

describe("useGovernance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetGovernanceResults.mockResolvedValue([]);
    mockGetGovernanceHalts.mockResolvedValue([]);
    mockGetGovernanceStatus.mockResolvedValue({ governanceEnabled: true });
  });

  it("starts with loading true then resolves to results, halts, and status", async () => {
    const results = [
      {
        id: 1,
        market: "KR",
        strategyType: "SHORT_TERM",
        passed: false,
        degraded: true,
        message: "Degraded",
      },
    ];
    const halts = [{ market: "KR", strategyType: "SHORT_TERM", reason: "MDD" }];
    mockGetGovernanceResults.mockResolvedValue(results);
    mockGetGovernanceHalts.mockResolvedValue(halts);
    mockGetGovernanceStatus.mockResolvedValue({ governanceEnabled: true });

    const { result } = renderHook(() => useGovernance(20));

    expect(result.current.loading).toBe(true);
    expect(result.current.results).toEqual([]);
    expect(result.current.halts).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.results).toEqual(results);
    expect(result.current.halts).toEqual(halts);
    expect(result.current.governanceEnabled).toBe(true);
    expect(result.current.error).toBeNull();
    expect(mockGetGovernanceResults).toHaveBeenCalledWith({ limit: 20 });
    expect(mockGetGovernanceHalts).toHaveBeenCalled();
    expect(mockGetGovernanceStatus).toHaveBeenCalled();
  });

  it("refetch calls APIs again and updates state", async () => {
    mockGetGovernanceResults
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 2, market: "US", strategyType: "MEDIUM_TERM", passed: true },
      ]);

    const { result } = renderHook(() => useGovernance(10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.results).toEqual([]);

    result.current.refetch();
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].market).toBe("US");
    expect(mockGetGovernanceResults).toHaveBeenCalledTimes(2);
  });

  it("sets error when one of the APIs rejects", async () => {
    mockGetGovernanceResults.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useGovernance(20));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.results).toEqual([]);
    expect(result.current.halts).toEqual([]);
  });
});
