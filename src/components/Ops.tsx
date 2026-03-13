import React, { useEffect, useState } from "react";
import { Card, DataTable, Badge, Button, Guardrail } from "./UI";
import { Switch } from "@/components/ui/switch";
import { getBatchJobs, type BatchJobDto } from "@/api/batchApi";
import { trigger } from "@/api/triggerApi";
import { getDataPipelineStatus, getAlerts, getAuditLogs, getTradeJournal, getModelStatus, getHealth, clearGovernanceHalt, getSystemSettings, putSystemSetting, type DataPipelineStatusDto, type AlertListResponseDto, type AuditLogListResponseDto, type AuditLogItemDto, type OpsModelStatusDto, type OpsHealthDto, type GovernanceCheckResultDto, type GovernanceHaltDto, type SystemSettingItemDto } from "@/api/opsApi";
import { useGovernance } from "@/hooks/useGovernance";
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
      case 'trade-journal':
        return <TradeJournalView />;
      case 'governance':
        return <GovernanceView />;
      case 'settings':
        return <SystemSettingsView />;
      default:
        return <div>Select an Ops page</div>;
    }
  };

  const subPageLabels: Record<string, string> = {
    data: "데이터 파이프라인",
    alerts: "알림센터",
    risk: "리스크 리포트",
    health: "시스템 헬스",
    model: "모델/예측",
    audit: "감사 로그",
    "trade-journal": "트레이드 저널",
    governance: "전략 거버넌스",
    settings: "시스템 설정",
  };
  const dataPipelineLabel = subPageLabels[subPage] ?? `Ops: ${subPage.toUpperCase()}`;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#f2f4f6] pb-3">
        <h2 className="text-lg font-bold text-[#191f28]">{dataPipelineLabel}</h2>
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

/** Jenkins 호환 날짜/시간: YYYY-MM-DD HH:mm:ss */
function formatDateTimeForPipeline(value: string | number | undefined): string {
  if (value === undefined || value === null) return "-";
  if (typeof value === "number") {
    if (value === 0 || value < 0 || !Number.isFinite(value)) return "-";
    if (value < 86400000) return "-";
  }
  try {
    const d = new Date(value as string | number);
    if (Number.isNaN(d.getTime())) return "-";
    const y = d.getFullYear();
    if (y < 1971 || y > 2100) return "-";
    const M = String(d.getMonth() + 1).padStart(2, "0");
    const D = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${y}-${M}-${D} ${h}:${m}:${s}`;
  } catch {
    return "-";
  }
}

/** Jenkins 호환 날짜: YYYY-MM-DD (최근 기준일 등). 8자리 숫자(YYYYMMDD) 또는 이미 YYYY-MM-DD 형식 수용 */
function formatDateForPipeline(value: string | undefined): string {
  if (value === undefined || value === null || String(value).trim() === "") return "-";
  const raw = String(value).trim();
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 8) {
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);
    return `${y}-${m}-${d}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return raw;
}

/** 파이프라인 상태 → Jenkins 빌드 결과: OK→SUCCESS, WARNING→UNSTABLE, ERROR→FAILURE */
function pipelineStatusToJenkinsStyle(status: string | undefined): string {
  if (status === undefined || status === null || status === "") return "-";
  switch (String(status).toUpperCase()) {
    case "OK": return "SUCCESS";
    case "WARNING": return "UNSTABLE";
    case "ERROR": return "FAILURE";
    default: return status;
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
          <div className="mt-2 flex gap-2 items-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline disabled:opacity-50"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              이전
            </button>
            <span className="text-sm text-gray-500">
              페이지 {((data.page ?? 0) + 1)} / {data.totalPages} (총 {data.totalElements}건)
            </span>
            <button
              type="button"
              className="text-sm text-primary hover:underline disabled:opacity-50"
              disabled={(data.page ?? 0) >= (data.totalPages ?? 1) - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

/** 트레이드 저널: GET /api/v1/ops/trade-journal 연동 (P6-3) */
function formatDateTimeForTradeJournal(iso: string | undefined): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "medium" });
  } catch {
    return iso;
  }
}

const TradeJournalView = () => {
  const [data, setData] = useState<AuditLogListResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getTradeJournal({ page, size: 20 })
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((e: unknown) => {
        if (mounted) setError(e instanceof Error ? e.message : "트레이드 저널 조회에 실패했습니다.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page]);

  const rows: string[][] =
    data?.items?.map((a: AuditLogItemDto) => {
      let action = "-";
      let symbol = "-";
      if (a.detailJson) {
        try {
          const detail = JSON.parse(a.detailJson) as { action?: string; symbol?: string };
          action = detail.action ?? "-";
          symbol = detail.symbol ?? "-";
        } catch {
          // ignore
        }
      }
      return [
        formatDateTimeForTradeJournal(a.occurredAt),
        action,
        symbol,
        (a.summary ?? "-").slice(0, 80) + ((a.summary?.length ?? 0) > 80 ? "…" : ""),
        a.result ?? "-",
      ];
    }) ?? [];

  return (
    <div className="space-y-4">
      <Card title="매매 결정 저널">
        <p className="text-sm text-gray-600 mb-2">파이프라인 매수/매도/스킵 결정 내역 (BUY, SKIP, DRY_RUN 등)</p>
        {loading && <Guardrail type="info" message="트레이드 저널 로딩 중…" />}
        {error && <Guardrail type="error" message={error} />}
        {!loading && !error && (
          <DataTable
            headers={["일시", "구분", "종목", "요약", "결과"]}
            rows={rows.length ? rows : [["이력 없음", "-", "-", "-", "-"]]}
          />
        )}
        {!loading && data && (data.totalPages ?? 0) > 1 && (
          <div className="mt-2 flex gap-2 items-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline disabled:opacity-50"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              이전
            </button>
            <span className="text-sm text-gray-500">
              페이지 {((data.page ?? 0) + 1)} / {data.totalPages} (총 {data.totalElements}건)
            </span>
            <button
              type="button"
              className="text-sm text-primary hover:underline disabled:opacity-50"
              disabled={(data.page ?? 0) >= (data.totalPages ?? 1) - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

/** 전략 거버넌스: 검사 결과 이력·활성 halt·halt 해제 (GET results/halts/status, PUT clear, trigger) */
const GOVERNANCE_CHECK_TRIGGER = "strategy-governance-check";
const GOVERNANCE_RESULTS_LIMIT = 20;

/** 검사 결과 테이블: run time, market, strategy type, passed/failed, MDD %, Sharpe, message. Single responsibility: present results only. */
function GovernanceResultsTable({ results }: { results: GovernanceCheckResultDto[] }) {
  const passedOrFailed = (r: GovernanceCheckResultDto) => {
    if (r.passed !== undefined) return r.passed ? "Passed" : "Failed";
    return r.degraded ? "Failed" : "Passed";
  };
  const message = (r: GovernanceCheckResultDto) =>
    (r.message != null && r.message !== "") ? r.message : "-";

  const rows: (string | number)[][] = results.map((r) => [
    formatDateTimeForPipeline(r.runAt),
    r.market ?? "-",
    r.strategyType ?? "-",
    passedOrFailed(r),
    r.mddPct != null ? `${formatNumber(Number(r.mddPct))}%` : "-",
    r.sharpeRatio != null ? formatNumber(Number(r.sharpeRatio)) : "-",
    message(r),
  ]);

  if (results.length === 0) {
    return (
      <div className="py-8 text-center text-[15px] text-[#8b95a1]">
        검사 결과가 없습니다. 아래 &quot;검사 지금 실행&quot;으로 1회 실행하거나, 시스템 설정에서 governance.enabled를 확인하세요.
      </div>
    );
  }

  return (
    <DataTable
      headers={["실행 시각", "시장", "전략 유형", "Passed/Failed", "MDD %", "Sharpe", "Message"]}
      rows={rows}
    />
  );
}

/** 활성 halt 카드: 테이블 + Clear 버튼 per row. Single responsibility: present halts and clear action. */
function GovernanceHaltsCard({
  halts,
  onClear,
  clearingKey,
}: {
  halts: GovernanceHaltDto[];
  onClear: (market: string, strategyType: string) => void;
  clearingKey: string | null;
}) {
  const haltRows: React.ReactNode[][] = halts.map((h) => {
    const key = `${h.market ?? ""}/${h.strategyType ?? ""}`;
    return [
      h.market ?? "-",
      h.strategyType ?? "-",
      formatDateTimeForPipeline(h.haltedAt),
      (h.reason ?? "-").slice(0, 80) + ((h.reason?.length ?? 0) > 80 ? "…" : ""),
      (
        <Button
          variant="secondary"
          className="text-xs py-1 px-2"
          disabled={clearingKey !== null}
          onClick={() => onClear(h.market ?? "", h.strategyType ?? "")}
        >
          {clearingKey === key ? "해제 중…" : "Clear"}
        </Button>
      ),
    ];
  });

  if (halts.length === 0) {
    return (
      <div className="py-8 text-center text-[15px] text-[#8b95a1]">
        활성 halt가 없습니다.
      </div>
    );
  }

  return (
    <>
      <p className="text-sm font-medium mb-2">거버넌스에 의한 중단: {halts.length}건</p>
      <DataTable
        headers={["시장", "전략 유형", "중단 시각", "사유", "조치"]}
        rows={haltRows}
      />
    </>
  );
}

const GovernanceView = () => {
  const { results, halts, governanceEnabled, loading, error, refetch } = useGovernance(GOVERNANCE_RESULTS_LIMIT);
  const [clearing, setClearing] = useState<string | null>(null);
  const [clearError, setClearError] = useState<string | null>(null);
  const [triggering, setTriggering] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);

  const handleClearHalt = (market: string, strategyType: string) => {
    const key = `${market}/${strategyType}`;
    setClearing(key);
    setClearError(null);
    clearGovernanceHalt(market, strategyType)
      .then(() => refetch())
      .catch((e: unknown) => {
        setClearError(e instanceof Error ? e.message : "halt 해제에 실패했습니다.");
      })
      .finally(() => setClearing(null));
  };

  const handleRunCheck = () => {
    setTriggering(true);
    setTriggerMessage(null);
    trigger(GOVERNANCE_CHECK_TRIGGER)
      .then((res) => {
        setTriggerMessage(res?.success ? "검사 실행 요청이 완료되었습니다. 잠시 후 결과를 새로고침합니다." : res?.message ?? "검사 실행 실패");
        if (res?.success) setTimeout(() => refetch(), 2000);
      })
      .catch((e: unknown) => {
        setTriggerMessage(e instanceof Error ? e.message : "검사 실행에 실패했습니다.");
      })
      .finally(() => setTriggering(false));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Guardrail type="info" message="전략 거버넌스 로딩 중…" />
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

  return (
    <div className="space-y-4">
      <Card title="전략 거버넌스 검사 결과 (최근 이력)">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={triggering}
            onClick={handleRunCheck}
          >
            {triggering ? "실행 중…" : "검사 지금 실행"}
          </Button>
          {triggerMessage != null && (
            <span className="text-sm text-gray-600">{triggerMessage}</span>
          )}
        </div>
        <GovernanceResultsTable results={results} />
        <p className="mt-2 text-xs text-gray-500">최대 {GOVERNANCE_RESULTS_LIMIT}건 (RUN_AT 내림차순)</p>
        {results.length === 0 && governanceEnabled === false && (
          <p className="mt-2 text-xs text-red-600">
            검사가 비활성화되어 있습니다. 시스템 설정에서 governance.enabled를 true로 설정한 뒤 검사를 실행하세요.
          </p>
        )}
      </Card>
      <Card title="활성 Halt 목록">
        <p className="text-xs text-gray-500 mb-2">해당 시장·전략 조합만 자동 매매 중단됩니다.</p>
        {clearError != null && <Guardrail type="error" message={clearError} />}
        <GovernanceHaltsCard halts={halts} onClear={handleClearHalt} clearingKey={clearing} />
      </Card>
    </div>
  );
};

/** 시스템 설정: GET/PUT /api/v1/system/settings (ADMIN 전용) */
const SystemSettingsView = () => {
  const [items, setItems] = useState<SystemSettingItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSettings = React.useCallback(() => {
    setLoading(true);
    setError(null);
    getSystemSettings()
      .then((list) => setItems(list ?? []))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "시스템 설정 조회에 실패했습니다.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const effective = (item: SystemSettingItemDto) =>
    dirty[item.key ?? ""] !== undefined ? dirty[item.key ?? ""] : (item.effectiveValue ?? "");

  const handleSave = (key: string, value: string) => {
    setSaving(key);
    putSystemSetting(key, value)
      .then(() => {
        setDirty((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        return getSystemSettings();
      })
      .then((list) => setItems(list ?? []))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
      })
      .finally(() => setSaving(null));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Guardrail type="info" message="시스템 설정 로딩 중…" />
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

  const groupLabels: Record<string, string> = {
    pipeline: "파이프라인",
    governance: "거버넌스",
    batch: "배치",
    risk: "리스크",
    intraday: "장중 변동성 돌파",
    marketData: "시장 데이터·WebSocket",
  };
  const groupOrder = ["pipeline", "marketData", "governance", "batch", "risk", "intraday"];
  const getGroup = (key: string) => {
    const prefix = key.split(".")[0] ?? "";
    return groupOrder.includes(prefix) ? prefix : "other";
  };
  const grouped = items.reduce<Record<string, SystemSettingItemDto[]>>((acc, item) => {
    const k = item.key ?? "";
    const g = getGroup(k);
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  const renderRow = (item: SystemSettingItemDto) => {
    const key = item.key ?? "";
    const type = item.type ?? "String";
    const desc = item.description ?? key;
    const val = effective(item);
    const isBool = type === "Boolean";
    const isNum = type === "BigDecimal";
    return (
      <div key={key} className="flex flex-wrap items-center gap-4 border-b border-gray-100 pb-3 last:border-0">
        <div className="min-w-[200px]">
          <div className="font-medium text-sm">{desc}</div>
          <div className="text-xs text-gray-500">{key}</div>
        </div>
        <div className="flex items-center gap-2">
          {isBool ? (
            <>
              <Switch
                checked={val === "true"}
                onCheckedChange={(checked) => setDirty((prev) => ({ ...prev, [key]: checked ? "true" : "false" }))}
              />
              <span className="text-sm">{val === "true" ? "ON" : "OFF"}</span>
            </>
          ) : isNum ? (
            <input
              type="number"
              className="border border-gray-300 rounded px-2 py-1 w-32 text-sm"
              value={dirty[key] !== undefined ? dirty[key] : val}
              onChange={(e) => setDirty((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          ) : (
            <span className="text-sm font-mono">{val || "(비어 있음)"}</span>
          )}
          <Button
            variant="secondary"
            className="text-xs py-1"
            disabled={saving !== null || dirty[key] === undefined}
            onClick={() => handleSave(key, dirty[key] ?? val)}
          >
            {saving === key ? "저장 중…" : "저장"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        활성/비활성 등 서버 전역 설정입니다. DB에 저장되며, 변경 후 캐시는 5분 이내 갱신됩니다.
      </p>
      {groupOrder.map((groupKey) => {
        const groupItems = grouped[groupKey];
        if (!groupItems?.length) return null;
        const title = groupLabels[groupKey] ?? groupKey;
        return (
          <Card key={groupKey} title={title}>
            <div className="space-y-4">{groupItems.map(renderRow)}</div>
          </Card>
        );
      })}
      {grouped.other?.length ? (
        <Card title="기타">
          <div className="space-y-4">{grouped.other.map(renderRow)}</div>
        </Card>
      ) : null}
      {items.length === 0 && (
        <p className="text-sm text-gray-500">표시할 시스템 설정이 없습니다.</p>
      )}
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
          <div className="mt-2 flex gap-2 items-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline disabled:opacity-50"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              이전
            </button>
            <span className="text-sm text-gray-500">
              페이지 {((data.page ?? 0) + 1)} / {data.totalPages} (총 {data.totalElements}건)
            </span>
            <button
              type="button"
              className="text-sm text-primary hover:underline disabled:opacity-50"
              disabled={(data.page ?? 0) >= (data.totalPages ?? 1) - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </button>
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

  const fetchPipeline = React.useCallback(() => {
    getDataPipelineStatus()
      .then((data) => setPipeline(data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "데이터 파이프라인 상태 조회에 실패했습니다."));
  }, []);

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
      formatDateForPipeline(s.lastBaselineDate),
      pipelineStatusToJenkinsStyle(s.status),
      s.errorSummary ?? "-",
    ]) ?? [];

  return (
    <div className="space-y-6">
      <Card title="데이터 파이프라인 현황 (원천별 수집 상태)">
        {loading && <Guardrail type="info" message="원천별 상태 로딩 중…" />}
        {error && <Guardrail type="error" message={error} />}
        {!loading && !error && (
          <DataTable
            headers={["원천", "마지막 빌드", "최근 기준일", "빌드 결과", "오류 요약"]}
            rows={sourceRows.length ? sourceRows : [["데이터 없음", "-", "-", "-", "-"]]}
          />
        )}
      </Card>
      <Batch role={auth.role} onRunComplete={fetchPipeline} />
    </div>
  );
};

const TRIGGER_PATH_PREFIX = "/api/v1/trigger/";

function triggerPathToSuffix(triggerPath: string | undefined): string | null {
  if (!triggerPath || !triggerPath.startsWith(TRIGGER_PATH_PREFIX)) return null;
  return triggerPath.slice(TRIGGER_PATH_PREFIX.length) || null;
}

function formatDateTime(value: string | number | undefined): string {
  return formatDateTimeForPipeline(value);
}

const BATCH_REFETCH_DELAY_MS = 2000;

export const Batch = ({ role, onRunComplete }: { role: string; onRunComplete?: () => void }) => {
  const isAdmin = role === "Admin";
  const [message, setMessage] = useState<string | null>(null);
  const [jobs, setJobs] = useState<BatchJobDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = React.useCallback(() => {
    setLoading(true);
    getBatchJobs()
      .then((list) => setJobs(list ?? []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "배치 목록 조회에 실패했습니다."))
      .finally(() => setLoading(false));
  }, []);

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
      if (res?.success) {
        setTimeout(() => {
          fetchJobs();
          onRunComplete?.();
        }, BATCH_REFETCH_DELAY_MS);
      }
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
      job.lastExecutionResult ?? "-",
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
          headers={["작업명", "스케줄", "최근 실행", "상태", "액션"]}
          rows={rows}
        />
      </Card>
      {!isAdmin && (
        <p className="text-[10px] text-gray-400">※ 실행 권한은 운영자(Ops)에게만 부여됩니다.</p>
      )}
    </div>
  );
};
