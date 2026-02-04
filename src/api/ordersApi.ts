import { apiFetch } from "./http";

export type OrderStatus = "PENDING" | "EXECUTED" | "PARTIAL" | "CANCELLED" | "FAILED";
export type OrderType = "BUY" | "SELL";

export interface OrderResponseDto {
  orderId: string;
  accountNo: string;
  symbol: string;
  orderType: OrderType;
  quantity: number;
  price: string;
  status: OrderStatus;
  orderTime: string;
  message?: string;
}

export function getOrders(accountNo: string) {
  return apiFetch<OrderResponseDto[]>(
    `/api/v1/orders?accountNo=${encodeURIComponent(accountNo)}`,
    { method: "GET" }
  );
}

export function cancelOrder(orderId: string, accountNo: string) {
  return apiFetch<void>(
    `/api/v1/orders/${encodeURIComponent(orderId)}?accountNo=${encodeURIComponent(accountNo)}`,
    { method: "DELETE" }
  );
}

