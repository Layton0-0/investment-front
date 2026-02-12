import { apiFetch } from "./http";

/** 데이터 파이프라인 원천별 상태 (DART/SEC/KRX/US) */
export interface DataPipelineSourceStatusDto {
  sourceId?: string;
  displayName?: string;
  lastRunTime?: string;
  lastBaselineDate?: string;
  status?: string;
  errorSummary?: string;
}

/** 데이터 파이프라인 전체 상태 (ADMIN 전용) */
export interface DataPipelineStatusDto {
  sources?: DataPipelineSourceStatusDto[];
  updatedAt?: string;
}

/**
 * 데이터 파이프라인 원천별 수집 상태 조회.
 * GET /api/v1/ops/data-pipeline/status (ADMIN 전용)
 */
export function getDataPipelineStatus(): Promise<DataPipelineStatusDto> {
  return apiFetch<DataPipelineStatusDto>("/api/v1/ops/data-pipeline/status", { method: "GET" });
}

/** 알림 이력 한 건 */
export interface AlertItemDto {
  id?: number;
  occurredAt?: string;
  level?: string;
  component?: string;
  message?: string;
}

/** 알림 목록 페이징 응답 */
export interface AlertListResponseDto {
  items?: AlertItemDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

/**
 * 알림 이력 조회 (페이징·레벨 필터).
 * GET /api/v1/ops/alerts (ADMIN 전용)
 */
export function getAlerts(params?: {
  page?: number;
  size?: number;
  level?: string;
}): Promise<AlertListResponseDto> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  if (params?.level != null && params.level !== "") sp.set("level", params.level);
  const qs = sp.toString();
  return apiFetch<AlertListResponseDto>(
    `/api/v1/ops/alerts${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

/** 감사 로그 한 건 */
export interface AuditLogItemDto {
  id?: number;
  occurredAt?: string;
  eventType?: string;
  userIdMasked?: string;
  accountNoMasked?: string;
  summary?: string;
  result?: string;
  ipAddress?: string;
}

/** 감사 로그 목록 페이징 응답 */
export interface AuditLogListResponseDto {
  items?: AuditLogItemDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

/**
 * 감사 로그 조회 (페이징·이벤트유형·기간 필터).
 * GET /api/v1/ops/audit (ADMIN 전용)
 */
export function getAuditLogs(params?: {
  page?: number;
  size?: number;
  eventType?: string;
  from?: string;
  to?: string;
}): Promise<AuditLogListResponseDto> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  if (params?.eventType != null && params.eventType !== "") sp.set("eventType", params.eventType);
  if (params?.from != null && params.from !== "") sp.set("from", params.from);
  if (params?.to != null && params.to !== "") sp.set("to", params.to);
  const qs = sp.toString();
  return apiFetch<AuditLogListResponseDto>(
    `/api/v1/ops/audit${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

/** Ops 모델/예측 상태 (ADMIN 전용) */
export interface OpsModelStatusDto {
  modelReady?: boolean;
  serviceUrl?: string;
  lastCheckAt?: string;
  version?: string;
  failureRateRecent?: number;
}

/**
 * 모델/예측 상태 조회.
 * GET /api/v1/ops/model/status (ADMIN 전용)
 */
export function getModelStatus(): Promise<OpsModelStatusDto> {
  return apiFetch<OpsModelStatusDto>("/api/v1/ops/model/status", { method: "GET" });
}

/** Ops 시스템 헬스 (ADMIN 전용) */
export interface OpsHealthDto {
  db?: string;
  redis?: string;
  predictionService?: string;
  lastCheckedAt?: string;
}

/**
 * 시스템 헬스 조회.
 * GET /api/v1/ops/health (ADMIN 전용)
 */
export function getHealth(): Promise<OpsHealthDto> {
  return apiFetch<OpsHealthDto>("/api/v1/ops/health", { method: "GET" });
}

/** 전략 거버넌스 검사 결과 한 건 (GET /api/v1/ops/governance/results) */
export interface GovernanceCheckResultDto {
  id?: number;
  runAt?: string;
  market?: string;
  strategyType?: string;
  mddPct?: number;
  sharpeRatio?: number;
  degraded?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

/** 전략 거버넌스 halt 한 건 (GET /api/v1/ops/governance/halts) */
export interface GovernanceHaltDto {
  market?: string;
  strategyType?: string;
  haltedAt?: string;
  reason?: string;
}

/**
 * 전략 거버넌스 최근 검사 결과 조회.
 * GET /api/v1/ops/governance/results (ADMIN 전용)
 */
export function getGovernanceResults(params?: { limit?: number }): Promise<GovernanceCheckResultDto[]> {
  const limit = params?.limit != null ? Math.min(500, Math.max(1, params.limit)) : 20;
  return apiFetch<GovernanceCheckResultDto[]>(
    `/api/v1/ops/governance/results?limit=${limit}`,
    { method: "GET" }
  );
}

/**
 * 전략 거버넌스 활성 halt 목록 조회.
 * GET /api/v1/ops/governance/halts (ADMIN 전용)
 */
export function getGovernanceHalts(): Promise<GovernanceHaltDto[]> {
  return apiFetch<GovernanceHaltDto[]>("/api/v1/ops/governance/halts", { method: "GET" });
}

/**
 * 전략 거버넌스 halt 해제.
 * PUT /api/v1/ops/governance/halts/{market}/{strategyType}/clear (ADMIN 전용)
 */
export function clearGovernanceHalt(
  market: string,
  strategyType: string,
  clearedBy?: string
): Promise<void> {
  const body = clearedBy != null && clearedBy !== "" ? { clearedBy } : undefined;
  return apiFetch<void>(
    `/api/v1/ops/governance/halts/${encodeURIComponent(market)}/${encodeURIComponent(strategyType)}/clear`,
    { method: "PUT", body: body != null ? JSON.stringify(body) : undefined }
  );
}
