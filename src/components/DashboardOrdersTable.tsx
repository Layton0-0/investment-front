import React from "react";
import { Card, DataTable } from "./UI";
import type { OrderResponseDto } from "@/api/ordersApi";

export interface DashboardOrdersTableProps {
  orders: OrderResponseDto[];
  maxRows?: number;
  title?: string;
}

export function DashboardOrdersTable({ orders, maxRows = 5, title = "최근 주문 현황" }: DashboardOrdersTableProps) {
  const slice = orders.slice(0, maxRows);
  const rows = slice.map((o) => [
    String(o.orderTime ?? "-"),
    String(o.symbol ?? "-"),
    String(o.orderType ?? "-"),
    String(o.price ?? "-"),
    String(o.status ?? "-")
  ]);

  return (
    <Card title={title}>
      <DataTable
        headers={["시간", "종목", "구분", "가격", "상태"]}
        rows={rows}
        getRowKey={(_, i) => `order-${slice[i]?.orderId ?? i}`}
      />
    </Card>
  );
}
