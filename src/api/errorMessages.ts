import { ApiError } from "./http";

export interface ErrorDisplayContext {
  mainAccount?: boolean;
  assets?: boolean;
  orders?: boolean;
}

/**
 * API 오류를 사용자에게 보여줄 한글 메시지로 변환합니다.
 * status, code, context에 따라 원인을 알 수 있는 상세 안내를 반환합니다.
 */
export function getDisplayErrorMessage(
  error: unknown,
  context?: ErrorDisplayContext
): string {
  if (!(error instanceof ApiError)) {
    const msg =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return msg || "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  const { status, code, message, details, traceId } = error;

  switch (status) {
    case 401:
      return "로그인이 만료되었습니다. 다시 로그인해 주세요.";

    case 404:
      if (context?.mainAccount) {
        return "선택한 계좌(모의/실)에 등록된 메인 계좌가 없습니다. 설정에서 계좌를 등록하거나 메인 계좌를 지정해 주세요.";
      }
      if (context?.assets) {
        return "해당 계좌의 자산·보유 종목 정보를 불러올 수 없습니다. 계좌가 본인 소유로 등록되었는지, API 키가 유효한지 설정에서 확인해 주세요.";
      }
      if (context?.orders) {
        return "해당 계좌의 주문 내역을 불러올 수 없습니다. 계좌·API 키를 확인해 주세요.";
      }
      return message || "요청한 정보를 찾을 수 없습니다.";

    case 400:
      if (code === "ACCOUNT_NOT_FOUND") {
        if (context?.mainAccount) {
          return "선택한 계좌(모의/실)에 등록된 메인 계좌가 없습니다. 설정에서 계좌를 등록하거나 메인 계좌를 지정해 주세요.";
        }
        if (context?.assets) {
          return "해당 계좌의 자산·보유 종목 정보를 불러올 수 없습니다. 계좌가 본인 소유로 등록되었는지, API 키가 유효한지 설정에서 확인해 주세요.";
        }
        if (context?.orders) {
          return "해당 계좌의 주문 내역을 불러올 수 없습니다. 계좌·API 키를 확인해 주세요.";
        }
      }
      if (code === "INVALID_INPUT") {
        if (details && details.length > 0) {
          return "입력값이 올바르지 않습니다: " + details.slice(0, 3).join(", ");
        }
        return "입력값이 올바르지 않습니다.";
      }
      return message || "요청이 올바르지 않습니다.";

    case 500:
    default:
      if (message && message !== `Request failed (${status})`) {
        return message;
      }
      const trace = traceId ? ` (추적 ID: ${traceId})` : "";
      return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." + trace;
  }
}
