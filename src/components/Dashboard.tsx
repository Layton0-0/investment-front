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
import { DashboardAutoInvestStatusCard } from "./DashboardAutoInvestStatusCard";
import { DashboardHoldingsTable } from "./DashboardHoldingsTable";
import { DashboardRecentOrdersTable } from "./DashboardRecentOrdersTable";
import { DashboardAttributionCard } from "./DashboardAttributionCard";
import {
  formatCurrencyKr,
  formatCurrencyUs,
  formatPercent,
  profitLossColorClass,
  isKrSymbol,
} from "@/lib/utils";
import type { ServerType } from "@/types";
import type { AccountPositionDto } from "@/api/accountApi";
import type { OrderResponseDto } from "@/api/ordersApi";

function sumPositionValues(positions: AccountPositionDto[]): number {
  return positions.reduce((sum, p) => sum + Number(p.totalValue ?? 0), 0);
}

function weightedAvgProfitLossRate(positions: AccountPositionDto[]): number | null {
  if (positions.length === 0) return null;
  let totalValue = 0;
  let weightedSum = 0;
  for (const p of positions) {
    const val = Number(p.totalValue ?? 0);
    const rate = Number(p.profitLossRate ?? 0);
    totalValue += val;
    weightedSum += val * rate;
  }
  return totalValue > 0 ? weightedSum / totalValue : null;
}

function filterOrdersByKr(orders: OrderResponseDto[], kr: boolean): OrderResponseDto[] {
  return orders.filter((o) => isKrSymbol(o.symbol) === kr);
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
    virtualOverseasSummary,
    realOverseasSummary,
    virtualRecentOrders,
    realRecentOrders,
    virtualPipelineSummary,
    realPipelineSummary,
    virtualTradingSetting,
    realTradingSetting,
    performanceSummary,
    virtualPeriodProfitLossUnsupported,
    loading,
    error
  } = useDashboardData(serverType);

  const isVirtual = Number(serverType) === 1;
  const assets = isVirtual ? virtualAssets : realAssets;
  const overseasSummary = isVirtual ? virtualOverseasSummary : realOverseasSummary;
  const recentOrders = isVirtual ? virtualRecentOrders : realRecentOrders;
  const pipelineSummary = isVirtual ? virtualPipelineSummary : realPipelineSummary;
  const tradingSetting = isVirtual ? virtualTradingSetting : realTradingSetting;
  const autoTradingEnabled = tradingSetting?.autoTradingEnabled ?? false;

  const positionsKr = isVirtual ? virtualPositionsKr : realPositionsKr;
  const positionsUs = isVirtual ? virtualPositionsUs : realPositionsUs;
  const ordersKr = useMemo(() => filterOrdersByKr(recentOrders, true), [recentOrders]);
  const ordersUs = useMemo(() => filterOrdersByKr(recentOrders, false), [recentOrders]);

  const krSummary = useMemo(() => {
    const totalAsset = sumPositionValues(positionsKr ?? []);
    const totalAssetDisplay =
      totalAsset > 0 ? totalAsset : (assets?.totalAssetValue != null ? Number(assets.totalAssetValue) : 0);
    const rate = weightedAvgProfitLossRate(positionsKr ?? []);
    return {
      totalAsset: totalAsset > 0 ? totalAsset : totalAssetDisplay,
      totalRate: rate ?? (assets?.totalProfitLossRate != null ? Number(assets.totalProfitLossRate) : null),
      dailyProfitLoss: performanceSummary?.dailyProfitLoss ?? null,
      deposit: assets?.deposit ?? null,
    };
  }, [positionsKr, assets?.totalAssetValue, assets?.totalProfitLossRate, assets?.deposit, performanceSummary?.dailyProfitLoss]);

  const usSummary = useMemo(() => {
    const totalAssetFromPositions = sumPositionValues(positionsUs ?? []);
    const totalAsset =
      overseasSummary?.totalAsset != null && Number(overseasSummary.totalAsset) > 0
        ? Number(overseasSummary.totalAsset)
        : totalAssetFromPositions;
    const rate =
      overseasSummary?.totalProfitLossRate != null
        ? Number(overseasSummary.totalProfitLossRate)
        : weightedAvgProfitLossRate(positionsUs ?? []);
    return {
      totalAsset,
      totalRate: rate ?? null,
      dailyProfitLoss: null as number | null,
      deposit: overseasSummary?.deposit != null ? Number(overseasSummary.deposit) : null,
    };
  }, [positionsUs, overseasSummary]);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        <div className={`min-w-0 ${isAdmin ? "" : "lg:col-span-2"}`}>
          <DashboardAutoInvestStatusCard
            autoTradingEnabled={autoTradingEnabled}
            pipelineSummary={pipelineSummary}
            pipelineAutoExecute={tradingSetting?.pipelineAutoExecute}
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

      <section className="space-y-4" aria-labelledby="kr-account-heading">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="kr-account-heading" className="text-lg font-semibold text-foreground">
            KR 국내 계좌
          </h2>
          {isVirtual && virtualPeriodProfitLossUnsupported && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              기간별 손익 조회는 모의계좌에서 지원하지 않습니다
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">총 자산</p>
              <p className="text-lg font-semibold text-foreground mt-1">
                {formatCurrencyKr(krSummary.totalAsset)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">총 수익률</p>
              <p
                className={`text-lg font-semibold mt-1 ${
                  krSummary.totalRate != null ? profitLossColorClass(krSummary.totalRate) : "text-foreground"
                }`}
              >
                {krSummary.totalRate != null ? formatPercent(krSummary.totalRate, { signed: true }) : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">일일 손익 (실계좌 기준)</p>
              <p
                className={`text-lg font-semibold mt-1 ${
                  krSummary.dailyProfitLoss != null ? profitLossColorClass(krSummary.dailyProfitLoss) : "text-foreground"
                }`}
              >
                {krSummary.dailyProfitLoss != null ? formatCurrencyKr(krSummary.dailyProfitLoss) : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">예수금</p>
              <p className="text-lg font-semibold text-foreground mt-1">
                {krSummary.deposit != null ? formatCurrencyKr(krSummary.deposit) : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          <div className="min-w-0">
            <DashboardHoldingsTable
              positions={positionsKr ?? []}
              title="국내 보유 종목"
              maxRows={5}
            />
          </div>
          <div className="min-w-0">
            <DashboardRecentOrdersTable
              orders={ordersKr}
              title="국내 최근 주문"
              maxRows={5}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="us-account-heading">
        <h2 id="us-account-heading" className="text-lg font-semibold text-foreground">
          US 미국 계좌
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">총 자산</p>
              <p className="text-lg font-semibold text-foreground mt-1">
                {formatCurrencyUs(usSummary.totalAsset)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">총 수익률</p>
              <p
                className={`text-lg font-semibold mt-1 ${
                  usSummary.totalRate != null ? profitLossColorClass(usSummary.totalRate) : "text-foreground"
                }`}
              >
                {usSummary.totalRate != null ? formatPercent(usSummary.totalRate, { signed: true }) : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">일일 손익</p>
              <p className="text-lg font-semibold text-foreground mt-1">
                {usSummary.dailyProfitLoss != null ? formatCurrencyUs(usSummary.dailyProfitLoss) : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">예수금</p>
              <p className="text-lg font-semibold text-foreground mt-1">
                {usSummary.deposit != null ? formatCurrencyUs(usSummary.deposit) : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          <div className="min-w-0">
            <DashboardHoldingsTable
              positions={positionsUs ?? []}
              title="미국 보유 종목"
              maxRows={5}
            />
          </div>
          <div className="min-w-0">
            <DashboardRecentOrdersTable
              orders={ordersUs}
              title="미국 최근 주문"
              maxRows={5}
            />
          </div>
        </div>
      </section>

      <DashboardAttributionCard />

      {tradingSetting?.pipelineAutoExecute === false && (
        <Guardrail
          message="파이프라인 자동 실행이 OFF입니다. 권장만 계산되며 실제 주문은 실행되지 않습니다. 설정에서 켜면 주문이 실행됩니다."
          type="info"
        />
      )}
    </div>
  );
};
