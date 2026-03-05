import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 국내 종목: 6자리 숫자 코드 */
export function isKrSymbol(symbol: string): boolean {
  return /^\d{6}$/.test(String(symbol).trim());
}

/** 원화 포맷 (천 단위 콤마). 0은 '₩0'으로 명시 표기 */
export function formatCurrencyKr(value: number | string | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (n === 0) return "₩0";
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/** 달러 포맷 (소수 0~2자리). 0은 '$0'으로 명시 표기 */
export function formatCurrencyUs(value: number | string | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (n === 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

/** 수익률 포맷 (양수 +, 음수 -). 색상용 클래스: positive → text-green-600, negative → text-destructive */
export function formatPercent(
  value: number | string | null | undefined,
  options?: { signed?: boolean }
): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const n = typeof value === "string" ? Number(value) : value;
  const pct = n.toFixed(2);
  if (options?.signed && n > 0) return `+${pct}%`;
  if (options?.signed && n < 0) return `${pct}%`;
  return `${pct}%`;
}

export function profitLossColorClass(value: number | string | null | undefined): string {
  const n = value == null ? 0 : Number(value);
  if (n > 0) return "text-green-600";
  if (n < 0) return "text-destructive";
  return "text-muted-foreground";
}
