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
  /** 거래 사유: 진입 시그널 유형 (파이프라인 매수 시) */
  signalType?: string | null;
  /** 거래 사유: 청산 규칙 유형 (파이프라인 매도 시) */
  exitRuleType?: string | null;
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

/** 주문 단건 조회 (상세·재시도 시). */
export async function getOrder(
  orderId: string,
  accountNo: string
): Promise<OrderResponseDto | null> {
  try {
    return await apiFetch<OrderResponseDto>(
      `/api/v1/orders/${encodeURIComponent(orderId)}?accountNo=${encodeURIComponent(accountNo)}`,
      { method: "GET" }
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return null;
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

/** 수동 주문 요청 (매수/매도). */
export interface OrderRequestDto {
  accountNo: string;
  symbol: string;
  orderType: OrderType;
  quantity: number;
  price: number | string;
  market?: string; // KR | US
}

export function placeOrder(request: OrderRequestDto): Promise<OrderResponseDto> {
  return apiFetch<OrderResponseDto>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify({
      ...request,
      price: typeof request.price === "number" ? request.price : Number(request.price)
    })
  });
}

