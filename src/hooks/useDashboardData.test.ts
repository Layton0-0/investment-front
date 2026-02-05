import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardData } from "./useDashboardData";

vi.mock("@/api/userAccountsApi", () => ({
  getMainAccount: vi.fn()
}));
vi.mock("@/api/accountApi", () => ({
  getAccountAssets: vi.fn(),
  getPositions: vi.fn()
}));
vi.mock("@/api/ordersApi", () => ({
  getOrders: vi.fn()
}));
vi.mock("@/api/pipelineApi", () => ({
  getPipelineSummary: vi.fn()
}));
vi.mock("@/api/settingsApi", () => ({
  getSettingByAccountNo: vi.fn()
}));
vi.mock("@/api/errorMessages", () => ({
  getDisplayErrorMessage: vi.fn((e: unknown) => (e instanceof Error ? e.message : "오류"))
}));

import { getMainAccount } from "@/api/userAccountsApi";
import { getAccountAssets, getPositions } from "@/api/accountApi";
import { getOrders } from "@/api/ordersApi";
import { getPipelineSummary } from "@/api/pipelineApi";
import { getSettingByAccountNo } from "@/api/settingsApi";

const mockGetMainAccount = vi.mocked(getMainAccount);
const mockGetAccountAssets = vi.mocked(getAccountAssets);
const mockGetPositions = vi.mocked(getPositions);
const mockGetOrders = vi.mocked(getOrders);
const mockGetPipelineSummary = vi.mocked(getPipelineSummary);
const mockGetSettingByAccountNo = vi.mocked(getSettingByAccountNo);

describe("useDashboardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMainAccount.mockResolvedValue(null);
  });

  it("starts with loading and no error", () => {
    mockGetMainAccount.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useDashboardData(1));
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.mainAccountsLoaded).toBe(false);
  });

  it("sets mainAccountsLoaded and clears loading when main accounts resolve", async () => {
    mockGetMainAccount
      .mockResolvedValueOnce({
        accountId: "v1",
        accountNo: "V123",
        accountNoMasked: "V***",
        brokerType: "KOREA_INVESTMENT",
        brokerTypeName: "한국투자",
        serverType: "1",
        serverTypeName: "모의"
      })
      .mockResolvedValueOnce(null);
    const { result } = renderHook(() => useDashboardData(1));
    await waitFor(() => {
      expect(result.current.mainAccountsLoaded).toBe(true);
    });
    expect(result.current.virtual).not.toBeNull();
    expect(result.current.virtual?.accountNo).toBe("V123");
    expect(result.current.real).toBeNull();
  });

  it("fetches assets and positions when account exists for serverType", async () => {
    mockGetMainAccount
      .mockResolvedValueOnce({
        accountId: "v1",
        accountNo: "V123",
        accountNoMasked: "V***",
        brokerType: "KOREA_INVESTMENT",
        brokerTypeName: "한국투자",
        serverType: "1",
        serverTypeName: "모의"
      })
      .mockResolvedValueOnce(null);
    mockGetAccountAssets.mockResolvedValue({
      accountNo: "V123",
      totalAssetValue: "1000000",
      deposit: "500000",
      stockValue: "500000",
      totalProfitLoss: "0",
      totalProfitLossRate: "0",
      orderableCash: "500000",
      currency: "KRW"
    });
    mockGetPositions.mockResolvedValue([]);
    mockGetOrders.mockResolvedValue([]);
    mockGetPipelineSummary.mockResolvedValue(null);
    mockGetSettingByAccountNo.mockResolvedValue(null);

    const { result } = renderHook(() => useDashboardData(1));
    await waitFor(() => {
      expect(result.current.mainAccountsLoaded).toBe(true);
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.virtualAssets).not.toBeNull();
    expect(result.current.virtualAssets?.totalAssetValue).toBe("1000000");
    expect(mockGetAccountAssets).toHaveBeenCalledWith("V123");
  });
});
