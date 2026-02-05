import { ApiError, apiFetch } from "./http";

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

/** 주문 목록 조회. 404 시 빈 배열 반환. */
export async function getOrders(
  accountNo: string
): Promise<OrderResponseDto[]> {
  try {
    return await apiFetch<OrderResponseDto[]>(
      `/api/v1/orders?accountNo=${encodeURIComponent(accountNo)}`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return [];
    }
    throw e;
  }
}

export function cancelOrder(orderId: string, accountNo: string) {
  return apiFetch<void>(
    `/api/v1/orders/${encodeURIComponent(orderId)}?accountNo=${encodeURIComponent(accountNo)}`,
    { method: "DELETE" }
  );
}

