import { apiFetch } from "./http";

/** 연말 세금·리포트 요약 (GET /api/v1/report/tax/summary). 스텁 시 일부 필드 null. */
export interface TaxReportSummaryDto {
  year?: number;
  domesticRealizedGainLoss?: number | null;
  overseasRealizedGainLoss?: number | null;
  dividendTotal?: number | null;
  estimatedTax?: number | null;
  disclaimer?: string | null;
}

export function getTaxSummary(year?: number | null): Promise<TaxReportSummaryDto> {
  const search = new URLSearchParams();
  if (year != null) search.set("year", String(year));
  const qs = search.toString();
  return apiFetch<TaxReportSummaryDto>(
    `/api/v1/report/tax/summary${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

/** 연말 세금 요약 내보내기 (CSV/PDF) 다운로드. GET /api/v1/report/tax/summary/export */
export function downloadTaxSummaryExport(year: number, format: "csv" | "pdf"): void {
  const params = new URLSearchParams({ format });
  params.set("year", String(year));
  const url = `/api/v1/report/tax/summary/export?${params.toString()}`;
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = base + url;
  window.open(fullUrl, "_blank", "noopener,noreferrer");
}
