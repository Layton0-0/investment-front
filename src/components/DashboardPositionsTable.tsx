import React from "react";
import { Card, DataTable } from "./UI";
import type { AccountPositionDto } from "@/api/accountApi";

export interface DashboardPositionsTableProps {
  positions: AccountPositionDto[];
  maxRows?: number;
  title?: string;
}

export function DashboardPositionsTable({ positions, maxRows = 5, title = "보유 잔고 (Top 5)" }: DashboardPositionsTableProps) {
  const slice = positions.slice(0, maxRows);
  const rows = slice.map((p) => [
    p.market ?? "-",
    `${p.name || p.symbol}`,
    String(p.quantity ?? "-"),
    String(p.averagePrice ?? "-"),
    String(p.currentPrice ?? "-"),
    `${Number(p.profitLossRate ?? 0) >= 0 ? "+" : ""}${p.profitLossRate ?? "-"}%`
  ]);

  return (
    <Card title={title}>
      <DataTable
        headers={["시장", "종목", "수량", "평균단가", "현재가", "수익률"]}
        rows={rows}
        getRowKey={(_, i) => `position-${slice[i]?.symbol ?? i}`}
      />
    </Card>
  );
}
