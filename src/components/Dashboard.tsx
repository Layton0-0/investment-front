import React, { useMemo } from "react";
import { Button, Guardrail } from "./UI";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardSummaryCards } from "./DashboardSummaryCards";
import { DashboardAccountCard } from "./DashboardAccountCard";
import { DashboardPositionsTable } from "./DashboardPositionsTable";
import { DashboardOrdersTable } from "./DashboardOrdersTable";
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
    positions,
    recentOrders,
    pipelineSummary,
    tradingSetting,
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

  if (!effectiveHasAccount && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-2xl text-muted-foreground">?</div>
        <h2 className="text-xl font-bold text-foreground">등록된 계좌가 없습니다</h2>
        <p className="max-w-md text-muted-foreground">
          투자를 시작하려면 설정 메뉴에서 {serverType === 1 ? "모의계좌" : "실계좌"} API 연동을 완료해주세요.
        </p>
        <Button onClick={() => onNavigate("/settings")}>계좌 설정하러 가기</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loading && <Guardrail message="대시보드 로딩 중…" type="info" />}
      {error && <Guardrail message={error} type="error" />}
      <DashboardSummaryCards onNavigate={onNavigate} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardAccountCard
          title="모의계좌 요약 (Virtual)"
          stats={statsVirtual}
          serverType={1}
          isActive={serverType === 1}
          tradingSetting={tradingSetting}
          pipelineSummary={pipelineSummary}
          onNavigateDetail={onNavigate}
          emptyMessage={
            virtualAssets == null && serverType !== 1
              ? "위 탭에서 모의계좌를 선택하면 데이터를 불러옵니다."
              : undefined
          }
        />
        <DashboardAccountCard
          title="실계좌 요약 (Real)"
          stats={statsReal}
          serverType={0}
          isActive={serverType === 0}
          tradingSetting={tradingSetting}
          pipelineSummary={pipelineSummary}
          onNavigateDetail={onNavigate}
          emptyMessage={
            realAssets == null && serverType !== 0
              ? "위 탭에서 실계좌를 선택하면 데이터를 불러옵니다."
              : undefined
          }
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPositionsTable positions={positions} />
        <DashboardOrdersTable orders={recentOrders} />
      </div>
      <Guardrail
        message="현재 서버는 Dry-Run 모드입니다. 실제 주문은 서버 설정(PIPELINE_AUTO_EXECUTE)이 필요합니다."
        type="info"
      />
    </div>
  );
};
