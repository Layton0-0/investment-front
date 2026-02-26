import { useCallback, useEffect, useState } from "react";
import { getMainAccount } from "@/api/userAccountsApi";
import { getAccountAssets, getPositions } from "@/api/accountApi";
import { getOrders } from "@/api/ordersApi";
import { getPipelineSummary } from "@/api/pipelineApi";
import { getSettingByAccountNo } from "@/api/settingsApi";
import { getPerformanceSummary } from "@/api/dashboardApi";
import { getDisplayErrorMessage } from "@/api/errorMessages";
import type { ServerType } from "@/types";
import type { MainAccountResponseDto } from "@/api/userAccountsApi";
import type { AccountAssetDto, AccountPositionDto } from "@/api/accountApi";
import type { OrderResponseDto } from "@/api/ordersApi";
import type { PipelineSummaryDto } from "@/api/pipelineApi";
import type { TradingSettingDto } from "@/api/settingsApi";
import type { DashboardPerformanceSummaryDto } from "@/api/dashboardApi";

export interface UseDashboardDataResult {
  virtual: MainAccountResponseDto | null;
  real: MainAccountResponseDto | null;
  virtualAssets: AccountAssetDto | null;
  realAssets: AccountAssetDto | null;
  virtualPositions: AccountPositionDto[];
  realPositions: AccountPositionDto[];
  /** 국내(KR) 잔고만 — 별도 API 호출 */
  virtualPositionsKr: AccountPositionDto[];
  virtualPositionsUs: AccountPositionDto[];
  realPositionsKr: AccountPositionDto[];
  realPositionsUs: AccountPositionDto[];
  virtualRecentOrders: OrderResponseDto[];
  realRecentOrders: OrderResponseDto[];
  virtualPipelineSummary: PipelineSummaryDto | null;
  realPipelineSummary: PipelineSummaryDto | null;
  virtualTradingSetting: TradingSettingDto | null;
  realTradingSetting: TradingSettingDto | null;
  /** 활성 탭(serverType) 기준 포지션·주문·파이프라인·설정 (호환용) */
  positions: AccountPositionDto[];
  recentOrders: OrderResponseDto[];
  pipelineSummary: PipelineSummaryDto | null;
  tradingSetting: TradingSettingDto | null;
  /** 대시보드 성과 요약 (총 평가액·MDD·Sharpe 등) */
  performanceSummary: DashboardPerformanceSummaryDto | null;
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
  const [virtualPositions, setVirtualPositions] = useState<AccountPositionDto[]>([]);
  const [realPositions, setRealPositions] = useState<AccountPositionDto[]>([]);
  const [virtualPositionsKr, setVirtualPositionsKr] = useState<AccountPositionDto[]>([]);
  const [virtualPositionsUs, setVirtualPositionsUs] = useState<AccountPositionDto[]>([]);
  const [realPositionsKr, setRealPositionsKr] = useState<AccountPositionDto[]>([]);
  const [realPositionsUs, setRealPositionsUs] = useState<AccountPositionDto[]>([]);
  const [virtualRecentOrders, setVirtualRecentOrders] = useState<OrderResponseDto[]>([]);
  const [realRecentOrders, setRealRecentOrders] = useState<OrderResponseDto[]>([]);
  const [virtualPipelineSummary, setVirtualPipelineSummary] = useState<PipelineSummaryDto | null>(null);
  const [realPipelineSummary, setRealPipelineSummary] = useState<PipelineSummaryDto | null>(null);
  const [virtualTradingSetting, setVirtualTradingSetting] = useState<TradingSettingDto | null>(null);
  const [realTradingSetting, setRealTradingSetting] = useState<TradingSettingDto | null>(null);
  const [performanceSummary, setPerformanceSummary] = useState<DashboardPerformanceSummaryDto | null>(null);
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

    const virtualAccountNo = virtual?.accountNo;
    const realAccountNo = real?.accountNo;

    if (!virtualAccountNo && !realAccountNo) {
      setLoading(false);
      setVirtualAssets(null);
      setRealAssets(null);
      setVirtualPositions([]);
      setRealPositions([]);
      setVirtualPositionsKr([]);
      setVirtualPositionsUs([]);
      setRealPositionsKr([]);
      setRealPositionsUs([]);
      setVirtualRecentOrders([]);
      setRealRecentOrders([]);
      setVirtualPipelineSummary(null);
      setRealPipelineSummary(null);
      setVirtualTradingSetting(null);
      setRealTradingSetting(null);
      setPerformanceSummary(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    const loadVirtual = virtualAccountNo
      ? Promise.all([
          getAccountAssets(virtualAccountNo),
          getPositions(virtualAccountNo, "KR"),
          getPositions(virtualAccountNo, "US"),
          getOrders(virtualAccountNo),
          getPipelineSummary(virtualAccountNo),
          getSettingByAccountNo(virtualAccountNo)
        ]).then(([assets, posKr, posUs, orders, pipeline, setting]) => ({
          assets,
          positionsKr: posKr ?? [],
          positionsUs: posUs ?? [],
          positions: [...(posKr ?? []), ...(posUs ?? [])],
          recentOrders: (orders ?? []).slice(0, 10),
          pipelineSummary: pipeline,
          tradingSetting: setting
        }))
      : Promise.resolve(null);

    const loadReal = realAccountNo
      ? Promise.all([
          getAccountAssets(realAccountNo),
          getPositions(realAccountNo, "KR"),
          getPositions(realAccountNo, "US"),
          getOrders(realAccountNo),
          getPipelineSummary(realAccountNo),
          getSettingByAccountNo(realAccountNo)
        ]).then(([assets, posKr, posUs, orders, pipeline, setting]) => ({
          assets,
          positionsKr: posKr ?? [],
          positionsUs: posUs ?? [],
          positions: [...(posKr ?? []), ...(posUs ?? [])],
          recentOrders: (orders ?? []).slice(0, 10),
          pipelineSummary: pipeline,
          tradingSetting: setting
        }))
      : Promise.resolve(null);

    (async () => {
      try {
        const [virtualData, realData, perf] = await Promise.all([
          loadVirtual,
          loadReal,
          getPerformanceSummary(),
        ]);
        if (!mounted) return;
        if (virtualData) {
          setVirtualAssets(virtualData.assets);
          setVirtualPositions(virtualData.positions);
          setVirtualPositionsKr(virtualData.positionsKr);
          setVirtualPositionsUs(virtualData.positionsUs);
          setVirtualRecentOrders(virtualData.recentOrders);
          setVirtualPipelineSummary(virtualData.pipelineSummary);
          setVirtualTradingSetting(virtualData.tradingSetting);
        } else {
          setVirtualAssets(null);
          setVirtualPositions([]);
          setVirtualPositionsKr([]);
          setVirtualPositionsUs([]);
          setVirtualRecentOrders([]);
          setVirtualPipelineSummary(null);
          setVirtualTradingSetting(null);
        }
        if (realData) {
          setRealAssets(realData.assets);
          setRealPositions(realData.positions);
          setRealPositionsKr(realData.positionsKr);
          setRealPositionsUs(realData.positionsUs);
          setRealRecentOrders(realData.recentOrders);
          setRealPipelineSummary(realData.pipelineSummary);
          setRealTradingSetting(realData.tradingSetting);
        } else {
          setRealAssets(null);
          setRealPositions([]);
          setRealPositionsKr([]);
          setRealPositionsUs([]);
          setRealRecentOrders([]);
          setRealPipelineSummary(null);
          setRealTradingSetting(null);
        }
        setPerformanceSummary(perf);
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
  }, [mainAccountsLoaded, virtual?.accountNo, real?.accountNo, refetchTrigger]);

  const isVirtual = Number(serverType) === 1;
  const positions = isVirtual ? virtualPositions : realPositions;
  const recentOrders = isVirtual ? virtualRecentOrders : realRecentOrders;
  const pipelineSummary = isVirtual ? virtualPipelineSummary : realPipelineSummary;
  const tradingSetting = isVirtual ? virtualTradingSetting : realTradingSetting;

  return {
    virtual,
    real,
    virtualAssets,
    realAssets,
    virtualPositions,
    realPositions,
    virtualPositionsKr,
    virtualPositionsUs,
    realPositionsKr,
    realPositionsUs,
    virtualRecentOrders,
    realRecentOrders,
    virtualPipelineSummary,
    realPipelineSummary,
    virtualTradingSetting,
    realTradingSetting,
    positions,
    recentOrders,
    pipelineSummary,
    tradingSetting,
    performanceSummary,
    loading,
    error,
    mainAccountsLoaded,
    refetch
  };
}
