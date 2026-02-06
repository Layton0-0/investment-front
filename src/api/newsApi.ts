import { apiFetch } from "./http";

export interface NewsItemDto {
  id: string;
  market?: string;
  source?: string;
  itemType?: string;
  symbol?: string;
  title: string;
  url?: string;
  createdAt?: string;
}

export interface NewsItemPageResponseDto {
  content: NewsItemDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export function getNews(params: {
  market?: string;
  source?: string;
  itemType?: string;
  symbol?: string;
  title?: string;
  from?: string; // yyyy-MM-dd
  to?: string; // yyyy-MM-dd
  page?: number;
  size?: number;
}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<NewsItemPageResponseDto>(`/api/v1/news${suffix}`, { method: "GET" });
}

/** 뉴스·공시 수집 즉시 실행 (DART·SEC EDGAR 등). */
export function collectNews(): Promise<{ message?: string }> {
  return apiFetch<{ message?: string }>("/api/v1/news/collect", { method: "POST" });
}

