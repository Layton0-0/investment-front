import React, { useMemo } from "react";
import { Button, Guardrail } from "./UI";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardSummaryCards } from "./DashboardSummaryCards";
import { DashboardAccountCard } from "./DashboardAccountCard";
import { DashboardPositionsTable } from "./DashboardPositionsTable";
import { DashboardOrdersTable } from "./DashboardOrdersTable";
import { PriceChart } from "./PriceChart";
import type { ServerType } from "@/types";

export interface DashboardProps {
  serverType: ServerType;
  hasAccount: boolean;
  onNavigate: (path: string) => void;
}

export const Dashboard = ({ serverType, hasAccount, onNavigate }: DashboardProps) => {
  const {
    virtual,
    real,
    virtualAssets,
    realAssets,
    virtualPositions,
    realPositions,
    virtualRecentOrders,
    realRecentOrders,
    virtualPipelineSummary,
    realPipelineSummary,
    virtualTradingSetting,
    realTradingSetting,
    performanceSummary,
    loading,
    error
  } = useDashboardData(serverType);

  const statsVirtual = useMemo(() => {
    if (!virtualAssets) return [];
    const total = Number(virtualAssets.totalAssetValue ?? 0);
    const rr = Number(virtualAssets.totalProfitLossRate ?? 0);
    return [
      { label: "모의 총 자산", value: `₩${total.toLocaleString("ko-KR")}`, trend: (rr >= 0 ? "positive" : "negative") as const },
      { label: "모의 수익률", value: `${rr >= 0 ? "+" : ""}${rr}%`, trend: (rr >= 0 ? "positive" : "negative") as const }
    ];
  }, [virtualAssets]);

  const statsReal = useMemo(() => {
    if (!realAssets) return [];
    const total = Number(realAssets.totalAssetValue ?? 0);
    const rr = Number(realAssets.totalProfitLossRate ?? 0);
    return [
      { label: "실계좌 총 자산", value: `₩${total.toLocaleString("ko-KR")}`, trend: (rr >= 0 ? "positive" : "negative") as const },
      { label: "실계좌 수익률", value: `${rr >= 0 ? "+" : ""}${rr}%`, trend: (rr >= 0 ? "positive" : "negative") as const }
    ];
  }, [realAssets]);

  const effectiveHasAccount = hasAccount && (!!virtual || !!real);

  const firstPositionForChart = useMemo(() => {
    const v = virtualPositions?.[0];
    const r = realPositions?.[0];
    if (v?.symbol) return { symbol: v.symbol, market: v.market ?? "KR" };
    if (r?.symbol) return { symbol: r.symbol, market: r.market ?? "KR" };
    return { symbol: "005930", market: "KR" as const };
  }, [virtualPositions, realPositions]);

  if (!effectiveHasAccount && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-2xl text-muted-foreground">?</div>
        <h2 className="text-xl font-bold text-foreground">설정에서 계좌를 연결해주세요</h2>
        <p className="max-w-md text-muted-foreground">
          투자를 시작하려면 설정 메뉴에서 {serverType === 1 ? "모의계좌" : "실계좌"} API 연동을 완료해주세요.
        </p>
        <Button onClick={() => onNavigate(`/settings?serverType=${serverType}`)}>설정으로 가기</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">내 자산·자동투자 상태를 한눈에 확인하세요.</p>
      {loading && <Guardrail message="대시보드 로딩 중…" type="info" />}
      {error && <Guardrail message={error} type="error" />}
      <DashboardSummaryCards onNavigate={onNavigate} />
      {performanceSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {performanceSummary.totalCurrentValue != null && (
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-xs text-muted-foreground">총 평가액</p>
              <p className="text-lg font-semibold">₩{Number(performanceSummary.totalCurrentValue).toLocaleString("ko-KR")}</p>
            </div>
          )}
          {performanceSummary.maxMddPct != null && (
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-xs text-muted-foreground">최대 낙폭 (MDD)</p>
              <p className="text-lg font-semibold">{(Number(performanceSummary.maxMddPct) * 100).toFixed(1)}%</p>
            </div>
          )}
          {performanceSummary.sharpeRatio != null && (
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-xs text-muted-foreground">Sharpe 비율</p>
              <p className="text-lg font-semibold">{Number(performanceSummary.sharpeRatio).toFixed(2)}</p>
            </div>
          )}
          {performanceSummary.var95Pct != null && (
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-xs text-muted-foreground">1일 VaR 95%</p>
              <p className="text-lg font-semibold">{Number(performanceSummary.var95Pct).toFixed(2)}%</p>
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardAccountCard
          title="모의계좌 요약 (Virtual)"
          stats={statsVirtual}
          serverType={1}
          isActive={serverType === 1}
          tradingSetting={virtualTradingSetting}
          pipelineSummary={virtualPipelineSummary}
          onNavigateDetail={onNavigate}
          emptyMessage={virtualAssets == null ? "모의계좌 데이터가 없습니다." : undefined}
        />
        <DashboardAccountCard
          title="실계좌 요약 (Real)"
          stats={statsReal}
          serverType={0}
          isActive={serverType === 0}
          tradingSetting={realTradingSetting}
          pipelineSummary={realPipelineSummary}
          onNavigateDetail={onNavigate}
          emptyMessage={realAssets == null ? "실계좌 데이터가 없습니다." : undefined}
        />
      </div>
      {firstPositionForChart && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">가격 추이</h2>
          <PriceChart
            symbol={firstPositionForChart.symbol}
            market={firstPositionForChart.market}
            title={`${firstPositionForChart.symbol} 일봉`}
            height={260}
          />
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPositionsTable title="모의계좌 보유 종목" positions={virtualPositions} />
        <DashboardPositionsTable title="실계좌 보유 종목" positions={realPositions} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardOrdersTable title="모의계좌 최근 주문" orders={virtualRecentOrders} />
        <DashboardOrdersTable title="실계좌 최근 주문" orders={realRecentOrders} />
      </div>
      <Guardrail
        message="현재 서버는 Dry-Run 모드입니다. 실제 주문은 서버 설정(PIPELINE_AUTO_EXECUTE)이 필요합니다."
        type="info"
      />
    </div>
  );
};
