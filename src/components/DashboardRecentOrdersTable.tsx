import React from "react";
import { Card, DataTable } from "./UI";
import type { OrderResponseDto } from "@/api/ordersApi";

export interface DashboardRecentOrdersTableProps {
  orders: OrderResponseDto[];
  maxRows?: number;
  title?: string;
}

const orderTypeLabel: Record<string, string> = {
  BUY: "매수",
  SELL: "매도"
};

const statusLabel: Record<string, string> = {
  EXECUTED: "체결",
  PARTIAL: "부분체결",
  PENDING: "대기",
  CANCELLED: "취소",
  FAILED: "실패"
};

export function DashboardRecentOrdersTable({
  orders,
  maxRows = 10,
  title = "최근 주문"
}: DashboardRecentOrdersTableProps) {
  const slice = orders.slice(0, maxRows);
  const rows = slice.map((o) => {
    const typeLabel = orderTypeLabel[o.orderType] ?? o.orderType;
    const status = statusLabel[o.status] ?? o.status;
    const isExecuted = o.status === "EXECUTED" || o.status === "PARTIAL";
    const badgeClass =
      o.orderType === "BUY"
        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
        : "bg-destructive/10 text-destructive";
    return [
      <span key="order" className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeClass}`}>
          {typeLabel}
        </span>
        <span className="font-medium">{o.symbol}</span>
      </span>,
      String(o.quantity ?? "-"),
      <span
        key="status"
        className={`px-2 py-0.5 rounded text-xs font-medium ${
          isExecuted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {status}
      </span>
    ];
  });

  return (
    <Card title={title}>
      <DataTable
        headers={["종목", "수량", "상태"]}
        rows={rows}
        getRowKey={(_, i) => `order-${slice[i]?.orderId ?? i}`}
      />
    </Card>
  );
}
