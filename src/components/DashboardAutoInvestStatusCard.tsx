import React from "react";
import { Card } from "./UI";
import type { PipelineSummaryDto } from "@/api/pipelineApi";
import type { TradingSettingDto } from "@/api/settingsApi";

export interface DashboardAutoInvestStatusCardProps {
  /** 자동투자 ON 여부 */
  autoTradingEnabled: boolean;
  pipelineSummary: PipelineSummaryDto | null;
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
  onNavigateDetail,
  serverType
}: DashboardAutoInvestStatusCardProps) {
  const lastRun = formatLastRun(pipelineSummary?.lastRunAt ?? null);
  const signalKr = pipelineSummary?.signalCountKr ?? 0;
  const signalUs = pipelineSummary?.signalCountUs ?? 0;

  return (
    <Card title="자동투자 상태">
      <div className="flex flex-col gap-4">
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
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">파이프라인</dt>
            <dd className="font-medium text-foreground">—</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">마지막 실행</dt>
            <dd className="font-medium text-foreground">{lastRun}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">시그널 수</dt>
            <dd className="font-medium text-foreground">
              KR {signalKr} / US {signalUs}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => onNavigateDetail(`/auto-invest?serverType=${serverType}`)}
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          자동투자 현황 자세히 보기
          <span aria-hidden>↗</span>
        </button>
      </div>
    </Card>
  );
}
