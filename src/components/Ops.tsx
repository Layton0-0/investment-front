import React, { useEffect, useState } from "react";
import { Card, DataTable, Badge, Button, Guardrail } from "./UI";
import { getBatchJobs, type BatchJobDto } from "@/api/batchApi";
import { trigger } from "@/api/triggerApi";

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
        return (
          <div className="space-y-4">
            <Card title="리스크 리포트">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 border border-[#f2f4f6]">
                  <div className="text-[10px] font-bold text-[#8b95a1]">VaR (95%)</div>
                  <div className="text-xl font-mono text-[#191f28]">₩45,200,000</div>
                </div>
                <div className="p-4 border border-[#f2f4f6]">
                  <div className="text-[10px] font-bold text-[#8b95a1]">BETA (Benchmark)</div>
                  <div className="text-xl font-mono">1.12</div>
                </div>
              </div>
              <DataTable 
                headers={['Metric', 'Current', 'Limit', 'Status']}
                rows={[
                  ['Daily Drawdown', '1.2%', '2.0%', 'SAFE'],
                  ['Max Leverage', '1.0x', '1.5x', 'SAFE'],
                  ['Concentration', '15%', '20%', 'SAFE'],
                ]}
              />
            </Card>
          </div>
        );
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
          실행
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
          headers={["Job Name", "Schedule", "Last Run", "Status", "Action"]}
          rows={rows}
        />
      </Card>
      {!isOps && (
        <p className="text-[10px] text-gray-400">※ "지금 실행" 권한은 운영자(Ops)에게만 부여됩니다.</p>
      )}
    </div>
  );
};
