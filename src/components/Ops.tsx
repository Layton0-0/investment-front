import React, { useEffect, useState } from "react";
import { Card, DataTable, Badge, Button, Guardrail } from "./UI";
import { getBatchJobs, type BatchJobDto } from "@/api/batchApi";
import { trigger } from "@/api/triggerApi";
import { getDataPipelineStatus, getAlerts, getAuditLogs, getModelStatus, getHealth, type DataPipelineStatusDto, type AlertListResponseDto, type AuditLogListResponseDto, type OpsModelStatusDto, type OpsHealthDto } from "@/api/opsApi";
import {
  getRiskSummary,
  getRiskLimits,
  getRiskHistory,
  type RiskSummaryDto,
  type RiskLimitsDto,
  type RiskHistoryItemDto,
} from "@/api/riskApi";
import { useAuth } from "@/app/AuthContext";

export const OpsDashboard = ({ subPage }: { subPage: string }) => {
  const renderContent = () => {
    switch (subPage) {
      case "data":
        return <DataPipelineView />;
      case 'alerts':
        return <AlertsView />;
      case 'risk':
        return <RiskView />;
      case 'health':
        return <HealthView />;
      case 'model':
        return <ModelView />;
      case 'audit':
        return <AuditView />;
      default:
        return <div>Select an Ops page</div>;
    }
  };

  const dataPipelineLabel = subPage === "data" ? "데이터 파이프라인" : `Ops: ${subPage.toUpperCase()}`;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <h2 className="text-lg font-bold uppercase tracking-tight">{dataPipelineLabel}</h2>
        <div className="flex gap-2">
          <Badge status="active">MASTER NODE: ALIVE</Badge>
          <Badge status="pending">SLAVE NODE: SYNCING</Badge>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

function formatNumber(n: number | undefined): string {
  if (n === undefined || n === null) return "-";
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 4 }).format(n);
}

function formatPct(n: number | undefined): string {
  if (n === undefined || n === null) return "-";
  return `${formatNumber(n)}%`;
}

const RiskView = () => {
  const [summary, setSummary] = useState<RiskSummaryDto | null>(null);
  const [limits, setLimits] = useState<RiskLimitsDto | null>(null);
  const [history, setHistory] = useState<RiskHistoryItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    Promise.all([
      getRiskSummary(),
      getRiskLimits(),
      getRiskHistory(),
    ])
      .then(([s, l, h]) => {
        if (mounted) {
          setSummary(s);
          setLimits(l);
          setHistory(h ?? []);
        }
      })
      .catch((e: unknown) => {
        if (mounted) {
          setError(e instanceof Error ? e.message : "리스크 데이터 조회에 실패했습니다.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Guardrail type="info" message="리스크 리포트 로딩 중…" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-4">
        <Guardrail type="error" message={error} />
      </div>
    );
  }

  const summaryRows =
    summary?.accounts?.map((a) => [
      a.accountNoMasked ?? "-",
      a.serverType === "1" ? "모의" : "실거래",
      formatNumber(a.openingBalance),
      formatNumber(a.currentValue),
      a.newBuyBlockedByDailyLoss ? "차단" : "허용",
      a.mdd != null ? formatPct(Number(a.mdd) * 100) : "-",
      formatNumber(a.peakValue),
    ]) ?? [];

  const limitsRows: string[][] = [];
  if (limits) {
    limitsRows.push(
      ["레짐 게이트", limits.regimeGateEnabled ? "사용" : "미사용"],
      ["VIX 임계값", formatNumber(limits.vixThreshold)],
      ["고변동 시 축소 비율", formatPct(limits.reduceSizeOnHighVolPct)],
      ["일일 손실 한도", formatPct(limits.dailyLossLimitPct)]
    );
  }

  const historyRows =
    history?.map((h) => [
      h.occurredAt
        ? new Date(h.occurredAt).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })
        : "-",
      h.eventType ?? "-",
      h.accountNoMasked ?? "-",
      h.description ?? "-",
    ]) ?? [];

  return (
    <div className="space-y-4">
      <Card title="리스크 요약 (백엔드 연동)">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="p-4 border border-[#f2f4f6]">
            <div className="text-[10px] font-bold text-[#8b95a1]">킬스위치</div>
            <div className="text-lg font-mono text-[#191f28]">
              {summary?.killSwitchActive ? "활성 (주문 차단)" : "비활성"}
            </div>
          </div>
          <div className="p-4 border border-[#f2f4f6]">
            <div className="text-[10px] font-bold text-[#8b95a1]">레짐 게이트</div>
            <div className="text-lg font-mono">{summary?.regimeGateEnabled ? "사용" : "미사용"}</div>
          </div>
          <div className="p-4 border border-[#f2f4f6]">
            <div className="text-[10px] font-bold text-[#8b95a1]">신규 매수</div>
            <div className="text-lg font-mono">
              {summary?.riskGateAllowsNewBuy ? "허용" : "제한"}
            </div>
          </div>
          <div className="p-4 border border-[#f2f4f6]">
            <div className="text-[10px] font-bold text-[#8b95a1]">게이트 배율</div>
            <div className="text-lg font-mono">
              {summary?.riskGateSizeMultiplier != null
                ? formatNumber(Number(summary.riskGateSizeMultiplier))
                : "-"}
            </div>
          </div>
          <div className="p-4 border border-[#f2f4f6]">
            <div className="text-[10px] font-bold text-[#8b95a1]">총 평가액(노출)</div>
            <div className="text-lg font-mono">
              {summary?.totalCurrentValue != null ? formatNumber(summary.totalCurrentValue) : "-"}
            </div>
          </div>
          <div className="p-4 border border-[#f2f4f6]">
            <div className="text-[10px] font-bold text-[#8b95a1]">최대 MDD</div>
            <div className="text-lg font-mono">
              {summary?.maxMddPct != null ? formatPct(Number(summary.maxMddPct) * 100) : "-"}
            </div>
          </div>
          <div className="p-4 border border-[#f2f4f6]">
            <div className="text-[10px] font-bold text-[#8b95a1]">VaR (95%)</div>
            <div className="text-lg font-mono">
              {summary?.var95Pct != null ? formatPct(Number(summary.var95Pct)) : "-"}
            </div>
          </div>
          <div className="p-4 border border-[#f2f4f6]">
            <div className="text-[10px] font-bold text-[#8b95a1]">CVaR (95%)</div>
            <div className="text-lg font-mono">
              {summary?.cvar95Pct != null ? formatPct(Number(summary.cvar95Pct)) : "-"}
            </div>
          </div>
        </div>
        {summaryRows.length > 0 && (
          <DataTable
            headers={["계좌", "서버", "시초 평가액", "현재 평가액", "신규 매수", "MDD", "피크"]}
            rows={summaryRows}
          />
        )}
      </Card>
      {limitsRows.length > 0 && (
        <Card title="한도 설정">
          <DataTable headers={["항목", "값"]} rows={limitsRows} />
        </Card>
      )}
      <Card title="리스크 이력 (게이트 축소·손실 한도 도달 등)">
        {historyRows.length > 0 ? (
          <DataTable
            headers={["일시", "유형", "계좌", "설명"]}
            rows={historyRows}
          />
        ) : (
          <p className="text-sm text-gray-500">이력이 없습니다.</p>
        )}
      </Card>
    </div>
  );
};

/** 모델/예측 상태: GET /api/v1/ops/model/status 연동 */
const ModelView = () => {
  const [data, setData] = useState<OpsModelStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getModelStatus()
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((e: unknown) => {
        if (mounted) setError(e instanceof Error ? e.message : "모델 상태 조회에 실패했습니다.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Guardrail type="info" message="모델/예측 상태 로딩 중…" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-4">
        <Guardrail type="error" message={error} />
      </div>
    );
  }

  const rows: string[][] = [
    ["모델 사용 가능", data?.modelReady ? "예" : "아니오"],
    ["서비스 URL", data?.serviceUrl ?? "-"],
    ["마지막 체크", data?.lastCheckAt ? formatDateTimeForPipeline(data.lastCheckAt) : "-"],
  ];
  if (data?.version != null && data.version !== "") {
    rows.push(["버전", data.version]);
  }
  if (data?.failureRateRecent != null) {
    rows.push(["최근 실패율", `${(Number(data.failureRateRecent) * 100).toFixed(2)}%`]);
  }

  return (
    <Card title="AI 모델 및 예측 현황">
      <DataTable
        headers={["항목", "값"]}
        rows={rows}
      />
    </Card>
  );
};

/** 시스템 헬스: GET /api/v1/ops/health 연동 */
const HealthView = () => {
  const [data, setData] = useState<OpsHealthDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getHealth()
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((e: unknown) => {
        if (mounted) setError(e instanceof Error ? e.message : "시스템 헬스 조회에 실패했습니다.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Guardrail type="info" message="시스템 헬스 로딩 중…" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-4">
        <Guardrail type="error" message={error} />
      </div>
    );
  }

  const dbStatus = data?.db === "UP" ? "GOOD" : data?.db === "DOWN" ? "ERROR" : "pending";
  const redisStatus = data?.redis === "UP" ? "GOOD" : data?.redis === "DOWN" ? "ERROR" : "pending";
  const predStatus = data?.predictionService === "UP" ? "GOOD" : data?.predictionService === "DOWN" ? "ERROR" : "pending";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <HealthCard label="DB" value={data?.db ?? "-"} status={dbStatus} />
        <HealthCard label="Redis" value={data?.redis ?? "-"} status={redisStatus} />
        <HealthCard label="예측 서비스" value={data?.predictionService ?? "-"} status={predStatus} />
      </div>
      {data?.lastCheckedAt && (
        <div className="text-sm text-gray-500">
          마지막 체크: {formatDateTimeForPipeline(data.lastCheckedAt)}
        </div>
      )}
    </div>
  );
};

interface HealthCardProps {
  label: string;
  value: string;
  status: string;
}

const HealthCard = ({ label, value, status }: HealthCardProps) => (
  <div className="border border-gray-200 p-3 bg-white">
    <div className="text-[10px] font-bold text-gray-400 uppercase">{label}</div>
    <div className="flex justify-between items-end mt-1">
      <div className="text-lg font-mono font-bold">{value}</div>
      <div className="text-[9px] font-bold text-gray-800">{status}</div>
    </div>
  </div>
);

function formatDateTimeForPipeline(iso: string | undefined): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

/** 감사 로그: GET /api/v1/ops/audit 연동 */
const AuditView = () => {
  const [data, setData] = useState<AuditLogListResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [eventType, setEventType] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getAuditLogs({ page, size: 20, eventType: eventType || undefined })
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((e: unknown) => {
        if (mounted) setError(e instanceof Error ? e.message : "감사 로그 조회에 실패했습니다.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page, eventType]);

  const rows =
    data?.items?.map((a) => [
      a.occurredAt ? formatDateTimeForPipeline(a.occurredAt) : "-",
      a.eventType ?? "-",
      a.userIdMasked ?? "-",
      a.accountNoMasked ?? "-",
      (a.summary ?? "-").slice(0, 120) + ((a.summary?.length ?? 0) > 120 ? "…" : ""),
      a.result ?? "-",
    ]) ?? [];

  return (
    <div className="space-y-4">
      <Card title="시스템 감사 로그">
        <div className="mb-2 flex gap-2 items-center">
          <label className="text-sm text-gray-600">이벤트 유형:</label>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value);
              setPage(0);
            }}
          >
            <option value="">전체</option>
            <option value="SETTING_CHANGE">설정 변경</option>
            <option value="MANUAL_TRIGGER">수동 트리거</option>
            <option value="REAL_ACCOUNT_GUARD_BLOCKED">실계좌 가드 차단</option>
          </select>
        </div>
        {loading && <Guardrail type="info" message="감사 로그 로딩 중…" />}
        {error && <Guardrail type="error" message={error} />}
        {!loading && !error && (
          <DataTable
            headers={["일시", "이벤트 유형", "사용자", "계좌", "요약", "결과"]}
            rows={rows.length ? rows : [["이력 없음", "-", "-", "-", "-", "-"]]}
          />
        )}
        {!loading && data && (data.totalPages ?? 0) > 1 && (
          <div className="mt-2 text-sm text-gray-500">
            페이지 {((data.page ?? 0) + 1)} / {data.totalPages} (총 {data.totalElements}건)
          </div>
        )}
      </Card>
    </div>
  );
};

/** 알림센터: 알림 이력 API 연동 */
const AlertsView = () => {
  const [data, setData] = useState<AlertListResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [level, setLevel] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getAlerts({ page, size: 20, level: level || undefined })
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((e: unknown) => {
        if (mounted) setError(e instanceof Error ? e.message : "알림 이력 조회에 실패했습니다.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page, level]);

  const rows =
    data?.items?.map((a) => [
      a.occurredAt ? formatDateTimeForPipeline(a.occurredAt) : "-",
      a.level ?? "-",
      a.component ?? "-",
      (a.message ?? "-").slice(0, 200) + ((a.message?.length ?? 0) > 200 ? "…" : ""),
    ]) ?? [];

  return (
    <div className="space-y-4">
      <Card title="시스템 알림 내역">
        <div className="mb-2 flex gap-2 items-center">
          <label className="text-sm text-gray-600">레벨 필터:</label>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(0);
            }}
          >
            <option value="">전체</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
        {loading && <Guardrail type="info" message="알림 이력 로딩 중…" />}
        {error && <Guardrail type="error" message={error} />}
        {!loading && !error && (
          <DataTable
            headers={["일시", "Level", "Component", "Message"]}
            rows={rows.length ? rows : [["이력 없음", "-", "-", "-"]]}
          />
        )}
        {!loading && data && (data.totalPages ?? 0) > 1 && (
          <div className="mt-2 text-sm text-gray-500">
            페이지 {((data.page ?? 0) + 1)} / {data.totalPages} (총 {data.totalElements}건)
          </div>
        )}
      </Card>
    </div>
  );
};

/** 데이터 파이프라인 페이지: 원천별 수집 상태 + 스케줄 현황(배치 작업·지금 실행) */
const DataPipelineView = () => {
  const auth = useAuth();
  const [pipeline, setPipeline] = useState<DataPipelineStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getDataPipelineStatus()
      .then((data) => {
        if (mounted) setPipeline(data);
      })
      .catch((e: unknown) => {
        if (mounted) setError(e instanceof Error ? e.message : "데이터 파이프라인 상태 조회에 실패했습니다.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const sourceRows =
    pipeline?.sources?.map((s) => [
      s.displayName ?? s.sourceId ?? "-",
      formatDateTimeForPipeline(s.lastRunTime),
      s.lastBaselineDate ?? "-",
      s.status ?? "-",
      s.errorSummary ?? "-",
    ]) ?? [];

  return (
    <div className="space-y-6">
      <Card title="데이터 파이프라인 현황 (원천별 수집 상태)">
        {loading && <Guardrail type="info" message="원천별 상태 로딩 중…" />}
        {error && <Guardrail type="error" message={error} />}
        {!loading && !error && (
          <DataTable
            headers={["원천", "마지막 실행", "최근 기준일", "상태", "오류 요약"]}
            rows={sourceRows.length ? sourceRows : [["데이터 없음", "-", "-", "-", "-"]]}
          />
        )}
      </Card>
      <Batch role={auth.role} />
    </div>
  );
};

const TRIGGER_PATH_PREFIX = "/api/v1/trigger/";

function triggerPathToSuffix(triggerPath: string | undefined): string | null {
  if (!triggerPath || !triggerPath.startsWith(TRIGGER_PATH_PREFIX)) return null;
  return triggerPath.slice(TRIGGER_PATH_PREFIX.length) || null;
}

function formatDateTime(iso: string | undefined): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export const Batch = ({ role }: { role: string }) => {
  const isAdmin = role === "Admin";
  const [message, setMessage] = useState<string | null>(null);
  const [jobs, setJobs] = useState<BatchJobDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getBatchJobs()
      .then((list) => {
        if (mounted) setJobs(list ?? []);
      })
      .catch((e: unknown) => {
        if (mounted) setError(e instanceof Error ? e.message : "배치 목록 조회에 실패했습니다.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const run = async (path: string) => {
    try {
      const res = await trigger(path);
      setMessage(res.message || (res.success ? "실행 완료" : "실행 실패"));
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "실행 실패");
    }
  };

  const rows = jobs.map((job) => {
    const triggerSuffix = triggerPathToSuffix(job.triggerPath);
    const action =
      isAdmin && triggerSuffix ? (
        <Button variant="ghost" className="text-[10px] p-1" onClick={() => run(triggerSuffix)}>
          지금 실행
        </Button>
      ) : (
        "-"
      );
    return [
      job.name ?? job.description ?? job.id ?? "-",
      job.cronDescription ?? job.cronExpression ?? "-",
      formatDateTime(job.lastExecutionTime),
      job.status ?? "-",
      action
    ];
  });

  return (
    <div className="space-y-6">
      {message && <Guardrail type="info" message={message} />}
      {loading && <Guardrail type="info" message="스케줄 목록 로딩 중…" />}
      {error && <Guardrail type="error" message={error} />}
      <Card title="스케줄 현황 (Batch Jobs)">
        <DataTable
          headers={["Job 이름", "스케줄", "마지막 실행", "상태", "지금 실행"]}
          rows={rows}
        />
      </Card>
      {!isAdmin && (
        <p className="text-[10px] text-gray-400">※ "지금 실행" 권한은 운영자(Ops)에게만 부여됩니다.</p>
      )}
    </div>
  );
};
