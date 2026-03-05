import React from "react";
import { Card } from "./UI";
import type { PipelineSummaryDto } from "@/api/pipelineApi";
import type { TradingSettingDto } from "@/api/settingsApi";

export interface DashboardAutoInvestStatusCardProps {
  /** 자동투자 ON 여부 */
  autoTradingEnabled: boolean;
  pipelineSummary: PipelineSummaryDto | null;
  /** 파이프라인 자동 실행 여부. false이면 권장만 계산·주문 미실행 안내 표시 */
  pipelineAutoExecute?: boolean | null;
  onNavigateDetail: (path: string) => void;
  serverType: number;
}

function formatLastRun(lastRunAt: string | null | undefined): string {
  if (!lastRunAt) return "—";
  try {
    const d = new Date(lastRunAt);
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }) + " KST";
  } catch {
    return "—";
  }
}

export function DashboardAutoInvestStatusCard({
  autoTradingEnabled,
  pipelineSummary,
  pipelineAutoExecute,
  onNavigateDetail,
  serverType
}: DashboardAutoInvestStatusCardProps) {
  const lastRun = formatLastRun(pipelineSummary?.lastRunAt ?? null);
  const signalKr = pipelineSummary?.signalCountKr ?? 0;
  const signalUs = pipelineSummary?.signalCountUs ?? 0;

  return (
    <Card title="자동투자 상태">
      <div className="flex flex-col gap-4">
        {pipelineAutoExecute === false && (
          <p className="text-xs text-muted-foreground">
            파이프라인 자동 실행 OFF — 권장만 계산되며 실제 주문은 실행되지 않습니다.
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {autoTradingEnabled ? "정상 실행중" : "중지됨"}
          </span>
          <span
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
              autoTradingEnabled
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {autoTradingEnabled ? "ON" : "OFF"}
          </span>
        </div>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground shrink-0">파이프라인</dt>
            <dd className="font-medium text-foreground text-right">—</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground shrink-0">마지막 실행</dt>
            <dd className="font-medium text-foreground text-right whitespace-nowrap">{lastRun}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground shrink-0">시그널 수</dt>
            <dd className="font-medium text-foreground text-right whitespace-nowrap">
              KR {signalKr} / US {signalUs}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => onNavigateDetail(`/auto-invest?serverType=${serverType}`)}
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 whitespace-nowrap"
        >
          자동투자 현황 자세히 보기
          <span aria-hidden>↗</span>
        </button>
      </div>
    </Card>
  );
}
