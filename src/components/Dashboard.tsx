import React, { useMemo } from "react";
import { Button, Guardrail } from "./UI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button as ShadButton } from "@/components/ui/button";
import { Power } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardKpiCards } from "./DashboardKpiCards";
import { DashboardAutoInvestStatusCard } from "./DashboardAutoInvestStatusCard";
import { DashboardHoldingsTable } from "./DashboardHoldingsTable";
import { DashboardRecentOrdersTable } from "./DashboardRecentOrdersTable";
import { DashboardAttributionCard } from "./DashboardAttributionCard";
import type { ServerType } from "@/types";

function regimeShortLabel(regime: string | undefined): string {
  if (!regime) return "—";
  switch (regime.toUpperCase()) {
    case "BULL":
      return "상승장";
    case "BEAR":
      return "하락장";
    case "NEUTRAL":
      return "횡보장";
    default:
      return regime;
  }
}

export interface DashboardProps {
  serverType: ServerType;
  hasAccount: boolean;
  onNavigate: (path: string) => void;
  /** Admin일 때 킬스위치 카드 표시 (자동투자 상태 카드와 같은 행 우측) */
  isAdmin?: boolean;
  killSwitchMessage?: { type: "success" | "error"; text: string } | null;
  onKillSwitchConfirm?: () => Promise<void>;
}

export const Dashboard = ({
  serverType,
  hasAccount,
  onNavigate,
  isAdmin = false,
  killSwitchMessage = null,
  onKillSwitchConfirm
}: DashboardProps) => {
  const {
    virtual,
    real,
    virtualAssets,
    realAssets,
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
    performanceSummary,
    marketRegime,
    loading,
    error
  } = useDashboardData(serverType);

  const isVirtual = Number(serverType) === 1;
  const assets = isVirtual ? virtualAssets : realAssets;
  const totalProfitLossRate = useMemo(() => {
    if (!assets?.totalProfitLossRate) return null;
    return Number(assets.totalProfitLossRate);
  }, [assets?.totalProfitLossRate]);

  const mergedPositions = useMemo(() => {
    const kr = isVirtual ? virtualPositionsKr : realPositionsKr;
    const us = isVirtual ? virtualPositionsUs : realPositionsUs;
    return [...(kr ?? []), ...(us ?? [])];
  }, [isVirtual, virtualPositionsKr, virtualPositionsUs, realPositionsKr, realPositionsUs]);

  const recentOrders = isVirtual ? virtualRecentOrders : realRecentOrders;
  const pipelineSummary = isVirtual ? virtualPipelineSummary : realPipelineSummary;
  const tradingSetting = isVirtual ? virtualTradingSetting : realTradingSetting;
  const autoTradingEnabled = tradingSetting?.autoTradingEnabled ?? false;

  const effectiveHasAccount = hasAccount && (!!virtual || !!real);

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
      {loading && <Guardrail message="대시보드 로딩 중…" type="info" />}
      {error && <Guardrail message={error} type="error" />}

      <DashboardKpiCards
        totalAssetValue={
          performanceSummary?.totalCurrentValue != null
            ? Number(performanceSummary.totalCurrentValue)
            : assets?.totalAssetValue != null
              ? Number(assets.totalAssetValue)
              : null
        }
        totalProfitLossRate={totalProfitLossRate}
        maxMddPct={performanceSummary?.maxMddPct ?? null}
      />

      <p className="text-sm text-muted-foreground" role="status">
        시장 상태: {regimeShortLabel(marketRegime?.regime)} | 파이프라인: {autoTradingEnabled ? "정상 동작중" : "중지됨"} | 보유 {mergedPositions.length}종목
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        <div className={`min-w-0 ${isAdmin ? "" : "lg:col-span-2"}`}>
          <DashboardAutoInvestStatusCard
            autoTradingEnabled={autoTradingEnabled}
            pipelineSummary={pipelineSummary}
            onNavigateDetail={onNavigate}
            serverType={Number(serverType)}
          />
        </div>
        {isAdmin && (
          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Power className="w-4 h-4 text-destructive" />
                킬스위치 (Ops)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                자동 실행 중인 파이프라인을 즉시 중지합니다.
              </p>
              {killSwitchMessage && (
                <p
                  className={`text-sm mb-3 ${
                    killSwitchMessage.type === "success" ? "text-green-600" : "text-destructive"
                  }`}
                >
                  {killSwitchMessage.text}
                </p>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <ShadButton variant="destructive" className="w-full">
                    자동 실행 긴급 중지
                  </ShadButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>자동 실행 중지</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 계좌에 대해 파이프라인을 지금 중지합니다. 실제 주문이 진행 중일 수 있습니다. 계속하시겠습니까?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async () => {
                        await onKillSwitchConfirm?.();
                      }}
                    >
                      중지
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        <div className="min-w-0">
          <DashboardHoldingsTable positions={mergedPositions} title="보유 종목" />
        </div>
        <div className="min-w-0">
          <DashboardRecentOrdersTable orders={recentOrders} title="최근 주문" />
        </div>
      </div>

      <DashboardAttributionCard />

      {tradingSetting?.pipelineAutoExecute === false && (
        <Guardrail
          message="실제 주문 실행이 꺼져 있습니다. 설정에서 파이프라인 자동 실행을 켜면 주문이 실행됩니다."
          type="info"
        />
      )}
    </div>
  );
};
