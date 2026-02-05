import React from "react";
import { Card, Badge, Stat } from "./UI";
import type { PipelineSummaryDto } from "@/api/pipelineApi";
import type { TradingSettingDto } from "@/api/settingsApi";
import type { ServerType } from "@/types";

export interface StatItem {
  label: string;
  value: string;
  trend: "positive" | "negative";
}

export interface DashboardAccountCardProps {
  title: string;
  stats: StatItem[];
  serverType: ServerType;
  isActive: boolean;
  tradingSetting: TradingSettingDto | null;
  pipelineSummary: PipelineSummaryDto | null;
  onNavigateDetail: (path: string) => void;
  emptyMessage?: string;
}

export function DashboardAccountCard({
  title,
  stats,
  serverType,
  isActive,
  tradingSetting,
  pipelineSummary,
  onNavigateDetail,
  emptyMessage
}: DashboardAccountCardProps) {
  if (emptyMessage) {
    return (
      <Card title={title}>
        <p className="text-sm py-4 text-muted-foreground">
          {emptyMessage}
        </p>
      </Card>
    );
  }

  const autoTradeOn = isActive && (tradingSetting?.autoTradingEnabled ?? false);
  const pipelineText =
    isActive && pipelineSummary
      ? `유니버스 KR ${pipelineSummary.universeCountKr ?? 0} / US ${pipelineSummary.universeCountUs ?? 0} · 시그널 KR ${pipelineSummary.signalCountKr ?? 0} / US ${pipelineSummary.signalCountUs ?? 0} · 보유 ${pipelineSummary.openPositionCount ?? 0}`
      : "—";

  return (
    <Card title={title}>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value} trend={s.trend} />
        ))}
        <div className="col-span-2 mt-2 p-4 bg-muted rounded-xl flex justify-between items-center">
          <Badge status={autoTradeOn ? "active" : "stopped"}>
            {autoTradeOn ? "AUTO-TRADING ON" : "AUTO-TRADING OFF"}
          </Badge>
          <span className="text-xs font-bold text-muted-foreground">
            {pipelineText}
          </span>
        </div>
        {isActive && (
          <p className="col-span-2 text-sm mt-1">
            <button
              type="button"
              onClick={() => onNavigateDetail(`/auto-invest?serverType=${serverType}`)}
              className="underline text-accent hover:no-underline cursor-pointer"
            >
              자동투자 현황 자세히 보기
            </button>
          </p>
        )}
      </div>
    </Card>
  );
}
