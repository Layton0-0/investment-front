import { apiFetch } from "./http";

/** 배치 작업 DTO (GET /batch/api/jobs 응답 항목) */
export interface BatchJobDto {
  id?: string;
  name?: string;
  description?: string;
  cronExpression?: string;
  /** cron을 한국어로 설명한 문자열 (표시용) */
  cronDescription?: string;
  timeZone?: string;
  status?: string;
  lastExecutionTime?: string;
  nextExecutionTime?: string;
  lastExecutionResult?: string;
  executionCount?: number;
  successCount?: number;
  failureCount?: number;
  /** 수동 트리거 API 경로 (POST). 있으면 "지금 실행" 버튼 노출 */
  triggerPath?: string;
}

/**
 * 배치 작업 목록 조회.
 * 백엔드: GET /api/v1/batch/jobs (nginx가 /api 만 백엔드로 전달하므로 이 경로 사용).
 */
export function getBatchJobs(): Promise<BatchJobDto[]> {
  return apiFetch<BatchJobDto[]>("/api/v1/batch/jobs", { method: "GET" });
}
