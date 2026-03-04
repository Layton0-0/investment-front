import React from "react";
import { Card, DataTable } from "./UI";
import type { AccountPositionDto } from "@/api/accountApi";

export interface DashboardHoldingsTableProps {
  positions: AccountPositionDto[];
  maxRows?: number;
  title?: string;
}

export function DashboardHoldingsTable({
  positions,
  maxRows = 10,
  title = "보유 종목"
}: DashboardHoldingsTableProps) {
  const slice = positions.slice(0, maxRows);
  const rows = slice.map((p) => {
    const market = p.market ?? "KR";
    const marketTag = market === "US" ? "US" : "KR";
    const rate = Number(p.profitLossRate ?? 0);
    const rateStr = `${rate >= 0 ? "+" : ""}${rate}%`;
    return [
      <span key="symbol" className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
          {marketTag}
        </span>
        <span className="font-medium">{p.symbol}</span>
      </span>,
      String(p.quantity ?? "-"),
      rateStr
    ];
  });

  return (
    <Card title={title}>
      <DataTable
        headers={["종목", "수량", "손익"]}
        rows={rows}
        getRowKey={(_, i) => `holding-${slice[i]?.symbol ?? i}`}
      />
    </Card>
  );
}
