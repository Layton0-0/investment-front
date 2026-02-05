import { useCallback, useEffect, useState } from "react";
import { getMainAccount } from "@/api/userAccountsApi";
import { getAccountAssets, getPositions } from "@/api/accountApi";
import { getOrders } from "@/api/ordersApi";
import { getPipelineSummary } from "@/api/pipelineApi";
import { getSettingByAccountNo } from "@/api/settingsApi";
import { getDisplayErrorMessage } from "@/api/errorMessages";
import type { ServerType } from "@/types";
import type { MainAccountResponseDto } from "@/api/userAccountsApi";
import type { AccountAssetDto, AccountPositionDto } from "@/api/accountApi";
import type { OrderResponseDto } from "@/api/ordersApi";
import type { PipelineSummaryDto } from "@/api/pipelineApi";
import type { TradingSettingDto } from "@/api/settingsApi";

export interface UseDashboardDataResult {
  virtual: MainAccountResponseDto | null;
  real: MainAccountResponseDto | null;
  virtualAssets: AccountAssetDto | null;
  realAssets: AccountAssetDto | null;
  positions: AccountPositionDto[];
  recentOrders: OrderResponseDto[];
  pipelineSummary: PipelineSummaryDto | null;
  tradingSetting: TradingSettingDto | null;
  loading: boolean;
  error: string | null;
  mainAccountsLoaded: boolean;
  refetch: () => void;
}

export function useDashboardData(serverType: ServerType): UseDashboardDataResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [virtual, setVirtual] = useState<MainAccountResponseDto | null>(null);
  const [real, setReal] = useState<MainAccountResponseDto | null>(null);
  const [virtualAssets, setVirtualAssets] = useState<AccountAssetDto | null>(null);
  const [realAssets, setRealAssets] = useState<AccountAssetDto | null>(null);
  const [positions, setPositions] = useState<AccountPositionDto[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderResponseDto[]>([]);
  const [pipelineSummary, setPipelineSummary] = useState<PipelineSummaryDto | null>(null);
  const [tradingSetting, setTradingSetting] = useState<TradingSettingDto | null>(null);
  const [mainAccountsLoaded, setMainAccountsLoaded] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError(null);
      try {
        const [vMain, rMain] = await Promise.all([
          getMainAccount("1"),
          getMainAccount("0")
        ]);
        if (!mounted) return;
        setVirtual(vMain);
        setReal(rMain);
        setMainAccountsLoaded(true);
      } catch (e: unknown) {
        if (!mounted) return;
        setError(getDisplayErrorMessage(e, { mainAccount: true }));
        setMainAccountsLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refetchTrigger]);

  useEffect(() => {
    if (!mainAccountsLoaded) return;
    const st = Number(serverType) === 1 ? "1" : "0";
    const main = st === "1" ? virtual : real;
    const accountNo = main?.accountNo;
    if (!accountNo) {
      setLoading(false);
      if (st === "1") setVirtualAssets(null);
      else setRealAssets(null);
      setPositions([]);
      setRecentOrders([]);
      setPipelineSummary(null);
      setTradingSetting(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const [assets, pos, orders, pipeline, setting] = await Promise.all([
          getAccountAssets(accountNo),
          getPositions(accountNo),
          getOrders(accountNo),
          getPipelineSummary(accountNo),
          getSettingByAccountNo(accountNo)
        ]);
        if (!mounted) return;
        if (st === "1") {
          setVirtualAssets(assets);
        } else {
          setRealAssets(assets);
        }
        setPositions(pos ?? []);
        setRecentOrders((orders ?? []).slice(0, 10));
        setPipelineSummary(pipeline);
        setTradingSetting(setting);
      } catch (e: unknown) {
        if (!mounted) return;
        setError(getDisplayErrorMessage(e, { assets: true }));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [mainAccountsLoaded, serverType, virtual, real, refetchTrigger]);

  return {
    virtual,
    real,
    virtualAssets,
    realAssets,
    positions,
    recentOrders,
    pipelineSummary,
    tradingSetting,
    loading,
    error,
    mainAccountsLoaded,
    refetch
  };
}
