import React, { useEffect, useState } from "react";
import { Card, DataTable, Badge, Button, Guardrail } from "./UI";
import { getBatchJobs, type BatchJobDto } from "@/api/batchApi";
import { trigger } from "@/api/triggerApi";
import {
  getRiskSummary,
  getRiskLimits,
  getRiskHistory,
  type RiskSummaryDto,
  type RiskLimitsDto,
  type RiskHistoryItemDto,
} from "@/api/riskApi";

export const OpsDashboard = ({ subPage }: { subPage: string }) => {
  const renderContent = () => {
    switch (subPage) {
      case 'data':
        return (
          <div className="space-y-4">
            <Card title="데이터 파이프라인 현황">
              <DataTable 
                headers={['Source', 'Type', 'Last Sync', 'Status', 'Latency']}
                rows={[
                  ['KRX', 'Quotes', '0.5s ago', 'ACTIVE', '12ms'],
                  ['Yahoo Finance', 'Quotes', '2.1s ago', 'ACTIVE', '450ms'],
                  ['NewsAPI', 'News', '5m ago', 'ACTIVE', '1.2s'],
                  ['OpenAI', 'Sentiment', '12m ago', 'IDLE', '-'],
                ]}
              />
            </Card>
          </div>
        );
      case 'alerts':
        return (
          <div className="space-y-4">
            <Card title="시스템 알림 내역">
              <DataTable 
                headers={['Time', 'Level', 'Component', 'Message']}
                rows={[
                  ['15:45:11', 'WARNING', 'RiskGate', 'Daily loss limit approached (85%)'],
                  ['15:30:00', 'INFO', 'Scheduler', 'US Market opening batch finished'],
                  ['14:20:01', 'ERROR', 'Execution', 'Order failed for AAPL: Rate limit'],
                ]}
              />
            </Card>
          </div>
        );
      case 'risk':
        return <RiskView />;
      case 'health':
        return <HealthView />;
      case 'model':
        return (
          <Card title="AI 모델 및 예측 현황">
            <DataTable 
              headers={['Model ID', 'Type', 'Target', 'Accuracy', 'Status']}
              rows={[
                ['M-KR-V1', 'XGBoost', 'KOSPI200', '68%', 'ACTIVE'],
                ['M-US-V2', 'LSTM', 'NASDAQ100', '72%', 'ACTIVE'],
                ['R-ETF-01', 'RL', 'Multi-Asset', '64%', 'TRAINING'],
              ]}
            />
          </Card>
        );
      case 'audit':
        return (
          <Card title="시스템 감사 로그">
            <DataTable 
              headers={['Timestamp', 'User', 'Action', 'IP Address', 'Result']}
              rows={[
                ['2024-02-04 15:50', 'admin', 'SETTING_CHANGE', '121.1.2.3', 'SUCCESS'],
                ['2024-02-04 15:48', 'user1', 'MANUAL_ORDER', '182.4.5.6', 'SUCCESS'],
                ['2024-02-04 15:45', 'system', 'AUTO_EXECUTE', '-', 'SUCCESS'],
              ]}
            />
          </Card>
        );
      default:
        return <div>Select an Ops page</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <h2 className="text-lg font-bold uppercase tracking-tight">Ops: {subPage.toUpperCase()}</h2>
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

const HealthView = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <HealthCard label="CPU" value="12%" status="GOOD" />
      <HealthCard label="RAM" value="4.2GB" status="GOOD" />
      <HealthCard label="Latency" value="15ms" status="GOOD" />
    </div>
    <div className="mt-4 border border-gray-200 p-4 font-mono text-xs bg-gray-50 overflow-y-auto max-h-60">
      [2024-02-04 15:46:01] System health heartbeat: OK<br/>
      [2024-02-04 15:45:01] Database connected: latency 2ms<br/>
      [2024-02-04 15:44:01] Redis cache: HIT 94%<br/>
      [2024-02-04 15:43:01] External API: KRX UP, Yahoo UP<br/>
      [2024-02-04 15:42:01] Memory usage stable at 4.2GB<br/>
      [2024-02-04 15:41:01] All microservices reporting healthy status
    </div>
  </div>
);

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
  const isOps = role === "Ops";
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
      isOps && triggerSuffix ? (
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
      {!isOps && (
        <p className="text-[10px] text-gray-400">※ "지금 실행" 권한은 운영자(Ops)에게만 부여됩니다.</p>
      )}
    </div>
  );
};
