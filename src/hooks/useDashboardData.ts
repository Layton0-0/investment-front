import { useCallback, useEffect, useState } from "react";
import { getMainAccount } from "@/api/userAccountsApi";
import { getAccountAssets, getOverseasSummary, getPositions, getProfitLoss } from "@/api/accountApi";
import { getOrders } from "@/api/ordersApi";
import { getPipelineSummary } from "@/api/pipelineApi";
import { getSettingByAccountNo } from "@/api/settingsApi";
import { getPerformanceSummary } from "@/api/dashboardApi";
import { getMarketRegime } from "@/api/macroApi";
import { getDisplayErrorMessage } from "@/api/errorMessages";
import { ApiError } from "@/api/http";
import type { ServerType } from "@/types";
import type { MainAccountResponseDto } from "@/api/userAccountsApi";
import type { AccountAssetDto, AccountPositionDto, OverseasBalanceSummaryDto, ProfitLossDto } from "@/api/accountApi";
import type { OrderResponseDto } from "@/api/ordersApi";
import type { PipelineSummaryDto } from "@/api/pipelineApi";
import type { TradingSettingDto } from "@/api/settingsApi";
import type { DashboardPerformanceSummaryDto } from "@/api/dashboardApi";
import type { RegimeResponseDto } from "@/api/macroApi";

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
  virtualOverseasSummary: OverseasBalanceSummaryDto | null;
  realOverseasSummary: OverseasBalanceSummaryDto | null;
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
  /** 기간별 손익 (한투 API, 최근 30일). 실패 시 null */
  virtualPeriodProfitLoss: ProfitLossDto | null;
  realPeriodProfitLoss: ProfitLossDto | null;
  /** 모의계좌에서 기간별손익 API 미지원 시 true (프론트 "모의계좌 미지원" 표기용) */
  virtualPeriodProfitLossUnsupported: boolean;
  /** 시장 레짐 (한줄 요약용). 실패 시 null */
  marketRegime: RegimeResponseDto | null;
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
  const [virtualOverseasSummary, setVirtualOverseasSummary] = useState<OverseasBalanceSummaryDto | null>(null);
  const [realOverseasSummary, setRealOverseasSummary] = useState<OverseasBalanceSummaryDto | null>(null);
  const [virtualRecentOrders, setVirtualRecentOrders] = useState<OrderResponseDto[]>([]);
  const [realRecentOrders, setRealRecentOrders] = useState<OrderResponseDto[]>([]);
  const [virtualPipelineSummary, setVirtualPipelineSummary] = useState<PipelineSummaryDto | null>(null);
  const [realPipelineSummary, setRealPipelineSummary] = useState<PipelineSummaryDto | null>(null);
  const [virtualTradingSetting, setVirtualTradingSetting] = useState<TradingSettingDto | null>(null);
  const [realTradingSetting, setRealTradingSetting] = useState<TradingSettingDto | null>(null);
  const [performanceSummary, setPerformanceSummary] = useState<DashboardPerformanceSummaryDto | null>(null);
  const [virtualPeriodProfitLoss, setVirtualPeriodProfitLoss] = useState<ProfitLossDto | null>(null);
  const [realPeriodProfitLoss, setRealPeriodProfitLoss] = useState<ProfitLossDto | null>(null);
  const [virtualPeriodProfitLossUnsupported, setVirtualPeriodProfitLossUnsupported] = useState(false);
  const [marketRegime, setMarketRegime] = useState<RegimeResponseDto | null>(null);
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
      setVirtualOverseasSummary(null);
      setRealOverseasSummary(null);
        setVirtualRecentOrders([]);
      setRealRecentOrders([]);
      setVirtualPipelineSummary(null);
      setRealPipelineSummary(null);
        setVirtualTradingSetting(null);
        setRealTradingSetting(null);
        setPerformanceSummary(null);
        setVirtualPeriodProfitLoss(null);
        setRealPeriodProfitLoss(null);
        setVirtualPeriodProfitLossUnsupported(false);
        setMarketRegime(null);
        return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);

    const loadVirtual = virtualAccountNo
      ? (async () => {
          let periodPl: ProfitLossDto | null = null;
          let periodPlUnsupported = false;
          try {
            periodPl = await getProfitLoss(virtualAccountNo, startStr, endStr);
          } catch (e) {
            if (e instanceof ApiError && e.code === "API_NOT_SUPPORTED") periodPlUnsupported = true;
            else periodPl = null;
          }
          const [assets, posKr, posUs, overseasSummary, orders, pipeline, setting] = await Promise.all([
            getAccountAssets(virtualAccountNo),
            getPositions(virtualAccountNo, "KR"),
            getPositions(virtualAccountNo, "US"),
            getOverseasSummary(virtualAccountNo),
            getOrders(virtualAccountNo),
            getPipelineSummary(virtualAccountNo),
            getSettingByAccountNo(virtualAccountNo)
          ]);
          return {
            assets,
            positionsKr: posKr ?? [],
            positionsUs: posUs ?? [],
            positions: [...(posKr ?? []), ...(posUs ?? [])],
            overseasSummary: overseasSummary ?? null,
            recentOrders: (orders ?? []).slice(0, 10),
            pipelineSummary: pipeline,
            tradingSetting: setting,
            periodProfitLoss: periodPl,
            periodProfitLossUnsupported: periodPlUnsupported
          };
        })()
      : Promise.resolve(null);

    const loadReal = realAccountNo
      ? Promise.all([
          getAccountAssets(realAccountNo),
          getPositions(realAccountNo, "KR"),
          getPositions(realAccountNo, "US"),
          getOverseasSummary(realAccountNo),
          getOrders(realAccountNo),
          getPipelineSummary(realAccountNo),
          getSettingByAccountNo(realAccountNo),
          getProfitLoss(realAccountNo, startStr, endStr).catch(() => null)
        ]).then(([assets, posKr, posUs, overseasSummary, orders, pipeline, setting, periodPl]) => ({
          assets,
          positionsKr: posKr ?? [],
          positionsUs: posUs ?? [],
          positions: [...(posKr ?? []), ...(posUs ?? [])],
          overseasSummary: overseasSummary ?? null,
          recentOrders: (orders ?? []).slice(0, 10),
          pipelineSummary: pipeline,
          tradingSetting: setting,
          periodProfitLoss: periodPl ?? null
        }))
      : Promise.resolve(null);

    (async () => {
      try {
        const [virtualData, realData, perf, regime] = await Promise.all([
          loadVirtual,
          loadReal,
          getPerformanceSummary(),
          getMarketRegime().catch(() => null),
        ]);
        if (!mounted) return;
        if (virtualData) {
          setVirtualAssets(virtualData.assets);
          setVirtualPositions(virtualData.positions);
          setVirtualPositionsKr(virtualData.positionsKr);
          setVirtualPositionsUs(virtualData.positionsUs);
          setVirtualOverseasSummary(virtualData.overseasSummary ?? null);
          setVirtualRecentOrders(virtualData.recentOrders);
          setVirtualPipelineSummary(virtualData.pipelineSummary);
          setVirtualTradingSetting(virtualData.tradingSetting);
          setVirtualPeriodProfitLoss(virtualData.periodProfitLoss ?? null);
          setVirtualPeriodProfitLossUnsupported(virtualData.periodProfitLossUnsupported ?? false);
        } else {
          setVirtualAssets(null);
          setVirtualPositions([]);
          setVirtualPositionsKr([]);
          setVirtualPositionsUs([]);
          setVirtualOverseasSummary(null);
          setVirtualRecentOrders([]);
          setVirtualPipelineSummary(null);
          setVirtualTradingSetting(null);
          setVirtualPeriodProfitLoss(null);
          setVirtualPeriodProfitLossUnsupported(false);
        }
        if (realData) {
          setRealAssets(realData.assets);
          setRealPositions(realData.positions);
          setRealPositionsKr(realData.positionsKr);
          setRealPositionsUs(realData.positionsUs);
          setRealOverseasSummary(realData.overseasSummary ?? null);
          setRealRecentOrders(realData.recentOrders);
          setRealPipelineSummary(realData.pipelineSummary);
          setRealTradingSetting(realData.tradingSetting);
          setRealPeriodProfitLoss(realData.periodProfitLoss ?? null);
        } else {
          setRealAssets(null);
          setRealPositions([]);
          setRealPositionsKr([]);
          setRealPositionsUs([]);
          setRealOverseasSummary(null);
          setRealRecentOrders([]);
          setRealPipelineSummary(null);
          setRealTradingSetting(null);
          setRealPeriodProfitLoss(null);
        }
        setPerformanceSummary(perf);
        setMarketRegime(regime ?? null);
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
    virtualOverseasSummary,
    realOverseasSummary,
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
    virtualPeriodProfitLoss,
    realPeriodProfitLoss,
    virtualPeriodProfitLossUnsupported,
    marketRegime,
    loading,
    error,
    mainAccountsLoaded,
    refetch
  };
}
