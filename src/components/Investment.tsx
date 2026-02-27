import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, DataTable, Badge, Button, Guardrail } from "./UI";
import { useAuth } from "@/app/AuthContext";
import { getMainAccount } from "@/api/userAccountsApi";
import { getPipelineSummary } from "@/api/pipelineApi";
import { getSignals, type SignalScoreDto } from "@/api/signalsApi";
import {
  activateStrategy,
  getStrategies,
  getStrategy,
  getStrategyComparison,
  stopStrategy,
  createOrUpdateStrategy,
  updateStrategyStatus,
  isStrategyEnabled,
  type StrategyDto,
  type StrategyComparisonItemDto,
  type StrategyStatus,
} from "@/api/strategyApi";
import type { PipelineSummaryDto } from "@/api/pipelineApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type SummaryState = Partial<PipelineSummaryDto> & { accountNo?: string };
type SignalWithMarket = SignalScoreDto & { market: string };

/** 시그널 발생 시각을 yyyy.MM.dd HH:mm:ss.SSS 형식으로 포맷. createdAt 없으면 basDt만 반환 */
function formatSignalTime(basDt: string | undefined, createdAt: string | undefined): string {
  if (createdAt) {
    const d = new Date(createdAt);
    if (!Number.isNaN(d.getTime())) {
      const y = d.getFullYear();
      const M = String(d.getMonth() + 1).padStart(2, "0");
      const D = String(d.getDate()).padStart(2, "0");
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      const ms = String(d.getMilliseconds()).padStart(3, "0");
      return `${y}.${M}.${D} ${h}:${m}:${s}.${ms}`;
    }
  }
  return basDt ?? "-";
}

export const AutoInvest = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryState | null>(null);
  const [signals, setSignalsState] = useState<SignalWithMarket[]>([]);
  const [noAccount, setNoAccount] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      setNoAccount(false);
      try {
        const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
        if (!main?.accountNo) {
          if (mounted) {
            setNoAccount(true);
            setLoading(false);
          }
          return;
        }
        const accountNo = main.accountNo;

        const [s, krSignals, usSignals] = await Promise.all([
          getPipelineSummary(accountNo).catch(() => null),
          getSignals({ market: "KR", page: 0, size: 10 }).catch(() => null),
          getSignals({ market: "US", page: 0, size: 10 }).catch(() => null)
        ]);

        if (!mounted) return;
        setSummary(
          s || {
            accountNo,
            universeCountKr: undefined,
            universeCountUs: undefined,
            signalCountKr: krSignals?.totalElements,
            signalCountUs: usSignals?.totalElements,
            allocationSummary: undefined,
            openPositionCount: undefined
          }
        );

        const combined: SignalWithMarket[] = [
          ...(krSignals?.content ?? []).map((x) => ({ ...x, market: "KR" })),
          ...(usSignals?.content ?? []).map((x) => ({ ...x, market: "US" }))
        ];
        setSignalsState(combined.slice(0, 20));
      } catch (e: unknown) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "자동투자 현황 조회에 실패했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [auth.serverType]);

  const allocationReady = summary?.allocationSummary && summary.allocationSummary !== "준비 중";

  if (noAccount && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">설정에서 계좌를 연결해주세요</h2>
        <p className="max-w-md text-muted-foreground">
          자동매매를 켜면 파이프라인이 실행됩니다. 설정에서 계좌 연결 후 자동투자를 켜주세요.
        </p>
        <Button onClick={() => navigate(`/settings?serverType=${auth.serverType}`)}>설정으로 가기</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loading && <Guardrail message="자동투자 현황 로딩 중…" type="info" />}
      {error && <Guardrail message={error} type="error" />}
      {!allocationReady && summary && !loading && (
        <Guardrail
          message="자동매매를 켜면 파이프라인이 실행됩니다. 설정에서 자동투자를 켜주세요."
          type="warning"
        />
      )}
      {!allocationReady && summary && !loading && (
        <div className="flex justify-start">
          <Button variant="secondary" onClick={() => navigate(`/settings?serverType=${auth.serverType}`)}>
            설정으로 가기
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="01. 유니버스">
          <div className="text-center py-4">
            <div className="text-2xl font-mono font-bold">
              {summary?.universeCountKr ?? "-"} / {summary?.universeCountUs ?? "-"}
            </div>
            <div className="text-[10px] text-[#8b95a1] uppercase mt-1">KR / US ITEMS</div>
          </div>
        </Card>
        <Card title="02. 시그널">
          <div className="text-center py-4">
            <div className="text-2xl font-mono font-bold">
              {summary?.signalCountKr ?? "-"} / {summary?.signalCountUs ?? "-"}
            </div>
            <div className="text-[10px] text-[#8b95a1] uppercase mt-1">BUY SIGNALS</div>
          </div>
        </Card>
        <Card title="03. 자금관리">
          <div className="text-center py-4">
            <div className="text-[14px] font-mono font-bold">
              {summary?.allocationSummary || "준비 중"}
            </div>
            <div className="text-[10px] text-[#8b95a1] uppercase mt-1">ALLOCATION / CASH</div>
          </div>
        </Card>
        <Card title="04. 매매실행">
          <div className="text-center py-4">
            <div className="text-2xl font-mono font-bold">{summary?.openPositionCount ?? "-"}</div>
            <div className="text-[10px] text-[#8b95a1] uppercase mt-1">OPEN POSITIONS</div>
          </div>
        </Card>
      </div>

      <Card title="실시간 시그널 발생 내역">
        <DataTable 
          headers={['시간', '시장', '종목', '전략', '시그널', '강도']}
          rows={signals.map((s) => [
            formatSignalTime(s.basDt, s.createdAt),
            String(s.market || "-"),
            String(s.symbol || "-"),
            String(s.factorType || "-"),
            "BUY",
            String(s.score ?? "-")
          ])}
        />
      </Card>

      <Card title="현재 파이프라인 포지션">
        <DataTable
          headers={["종목", "시장", "진입일", "수량", "진입가", "시그널 유형", "청산 규칙"]}
          rows={(summary?.openPositionList ?? []).map((p) => [
            String(p.symbol ?? "-"),
            String(p.market ?? "-"),
            String(p.entryDt ?? "-"),
            String(p.quantity ?? "-"),
            typeof p.entryPrice === "number" ? String(p.entryPrice) : String(p.entryPrice ?? "-"),
            String(p.signalType ?? "-"),
            String(p.exitRuleType ?? "-")
          ])}
          getRowKey={(_, i) => `pos-${(summary?.openPositionList ?? [])[i]?.positionId ?? i}`}
        />
      </Card>

      <Guardrail message="신규 매수 축소/중단: 리스크 게이트 발동 (일일 손실 한도 근접)" type="error" />
    </div>
  );
};

export const Strategy = ({ market }: { market: 'kr' | 'us' }) => (
  <StrategyInner market={market} />
);

const apiMarketFromRoute = (m: "kr" | "us"): "KR" | "US" => (m === "kr" ? "KR" : "US");

const STRATEGY_TYPES: StrategyDto["strategyType"][] = ["SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"];
const STRATEGY_STATUSES: StrategyStatus[] = ["ACTIVE", "STOPPED", "PAUSED"];

function StrategyDetailModal({
  open,
  onOpenChange,
  data,
  loading,
  strategyType,
  onStatusChange,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: StrategyDto | null;
  loading: boolean;
  strategyType: string | null;
  onStatusChange: (status: StrategyStatus) => void;
  onEdit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>전략 상세 {strategyType ?? ""}</DialogTitle>
        </DialogHeader>
        {loading && <p className="text-sm text-muted-foreground">로딩 중…</p>}
        {!loading && data && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">계좌</span>
              <span>{data.accountNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">시장</span>
              <span>{data.market ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">상태</span>
              <select
                value={data.status}
                onChange={(e) => onStatusChange(e.target.value as StrategyStatus)}
                className="border rounded px-2 py-1 text-sm"
              >
                {STRATEGY_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">최대 투자금</span>
              <span>
                {data.maxInvestmentAmount != null
                  ? Number(data.maxInvestmentAmount).toLocaleString()
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">성공률</span>
              <span>
                {data.successRate != null ? `${Number(data.successRate).toFixed(1)}%` : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">마지막 실행</span>
              <span>{data.lastExecutedAt ? new Date(data.lastExecutedAt).toLocaleString() : "-"}</span>
            </div>
          </div>
        )}
        {!loading && !data && strategyType && (
          <p className="text-sm text-muted-foreground">전략을 불러올 수 없습니다.</p>
        )}
        <DialogFooter>
          {data && (
            <Button variant="secondary" onClick={onEdit}>
              편집
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StrategyFormModal({
  open,
  onOpenChange,
  mode,
  initial,
  apiMarket,
  submitting,
  setSubmitting,
  error,
  setError,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial: Partial<StrategyDto>;
  apiMarket: "KR" | "US";
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  error: string | null;
  setError: (v: string | null) => void;
  onSuccess: () => void;
}) {
  const [accountNo, setAccountNo] = useState(initial.accountNo ?? "");
  const [market, setMarket] = useState(initial.market ?? apiMarket);
  const [strategyType, setStrategyType] = useState<StrategyDto["strategyType"]>(
    (initial.strategyType as StrategyDto["strategyType"]) ?? "SHORT_TERM"
  );
  const [status, setStatus] = useState<StrategyStatus>(initial.status ?? "STOPPED");
  const [maxInvestmentAmount, setMaxInvestmentAmount] = useState(
    initial.maxInvestmentAmount != null ? String(initial.maxInvestmentAmount) : ""
  );

  useEffect(() => {
    if (!open) return;
    setAccountNo(initial.accountNo ?? "");
    setMarket(initial.market ?? apiMarket);
    setStrategyType((initial.strategyType as StrategyDto["strategyType"]) ?? "SHORT_TERM");
    setStatus((initial.status as StrategyStatus) ?? "STOPPED");
    setMaxInvestmentAmount(
      initial.maxInvestmentAmount != null ? String(initial.maxInvestmentAmount) : ""
    );
  }, [open, initial.accountNo, initial.market, initial.strategyType, initial.status, initial.maxInvestmentAmount, apiMarket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: StrategyDto = {
        accountNo,
        market: market || apiMarket,
        strategyType,
        status,
        maxInvestmentAmount: maxInvestmentAmount ? Number(maxInvestmentAmount) : undefined,
      };
      await createOrUpdateStrategy(payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "전략 추가" : "전략 편집"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Guardrail message={error} type="error" />}
          <div className="space-y-2">
            <Label htmlFor="strategy-accountNo">계좌번호</Label>
            <Input
              id="strategy-accountNo"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="strategy-market">시장</Label>
            <select
              id="strategy-market"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="KR">KR</option>
              <option value="US">US</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="strategy-type">전략 타입</Label>
            <select
              id="strategy-type"
              value={strategyType}
              onChange={(e) => setStrategyType(e.target.value as StrategyDto["strategyType"])}
              className="w-full border rounded px-3 py-2"
            >
              {STRATEGY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="strategy-status">상태</Label>
            <select
              id="strategy-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StrategyStatus)}
              className="w-full border rounded px-3 py-2"
            >
              {STRATEGY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="strategy-maxAmount">최대 투자금</Label>
            <Input
              id="strategy-maxAmount"
              type="number"
              min={0}
              value={maxInvestmentAmount}
              onChange={(e) => setMaxInvestmentAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "저장 중…" : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const StrategyInner = ({ market }: { market: "kr" | "us" }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<StrategyDto[]>([]);
  const [comparison, setComparison] = useState<StrategyComparisonItemDto[]>([]);
  const [mainAccountNo, setMainAccountNo] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedStrategyType, setSelectedStrategyType] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<StrategyDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formInitial, setFormInitial] = useState<Partial<StrategyDto>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const apiMarket = apiMarketFromRoute(market);

  const refetchList = async () => {
    const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
    if (!main) return;
    const list = await getStrategies(main.accountNo, apiMarket);
    setItems(list ?? []);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
        if (!main || !mounted) return;
        setMainAccountNo(main.accountNo);
        const [list, comp] = await Promise.all([
          getStrategies(main.accountNo, apiMarket),
          getStrategyComparison(apiMarket).catch(() => []),
        ]);
        if (!mounted) return;
        setItems(list ?? []);
        setComparison(Array.isArray(comp) ? comp : []);
      } catch (e: unknown) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "전략 목록 조회에 실패했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [auth.serverType, market, apiMarket]);

  const handleActivate = async (strategyType: string) => {
    const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
    if (!main) return;
    await activateStrategy(main.accountNo, strategyType, apiMarket);
    await refetchList();
  };

  const handleStop = async (strategyType: string) => {
    const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
    if (!main) return;
    await stopStrategy(main.accountNo, strategyType, apiMarket);
    await refetchList();
  };

  const openDetail = async (strategyType: string) => {
    const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
    if (!main) return;
    setSelectedStrategyType(strategyType);
    setDetailOpen(true);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const d = await getStrategy(main.accountNo, strategyType, apiMarket);
      setDetailData(d);
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedStrategyType(null);
    setDetailData(null);
  };

  const handleStatusChange = async (newStatus: StrategyStatus) => {
    if (!mainAccountNo || !selectedStrategyType || !detailData) return;
    try {
      await updateStrategyStatus(
        mainAccountNo,
        selectedStrategyType,
        { status: newStatus },
        apiMarket
      );
      const d = await getStrategy(mainAccountNo, selectedStrategyType, apiMarket);
      setDetailData(d);
      await refetchList();
    } catch {
      // keep detail as is; optional: set a toast
    }
  };

  const openEdit = (s: StrategyDto) => {
    setFormMode("edit");
    setFormInitial({
      ...s,
      accountNo: s.accountNo,
      market: s.market ?? apiMarket,
      strategyType: s.strategyType,
      status: s.status,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormInitial({});
    setFormError(null);
  };

  const comparisonHeaders = ["시장", "전략", "CAGR (%)", "MDD (%)", "Sharpe", "최근 실행"];
  const comparisonRows: React.ReactNode[][] = comparison.map((r) => [
    r.market,
    r.description,
    r.cagr != null ? Number(r.cagr).toFixed(2) : "-",
    r.mddPct != null ? Number(r.mddPct).toFixed(2) : "-",
    r.sharpeRatio != null ? Number(r.sharpeRatio).toFixed(2) : "-",
    r.lastRunAt ? new Date(r.lastRunAt).toLocaleString("ko-KR") : "-",
  ]);

  return (
    <div className="space-y-6">
      {comparison.length > 0 && (
        <Card title="전략 비교 (백테스트 메트릭)">
          <p className="text-xs text-muted-foreground mb-3">
            거버넌스 검사로 저장된 최신 백테스트 결과입니다. CAGR는 추후 반영됩니다.
          </p>
          <DataTable
            headers={comparisonHeaders}
            rows={comparisonRows}
            getRowKey={(_, i) => comparison[i] ? `${comparison[i].market}-${comparison[i].strategyType}` : String(i)}
          />
        </Card>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold uppercase">
          {market === "kr" ? "국내" : "미국"} 전략 목록
        </h2>
        <Badge status="active">SYSTEM ACTIVE</Badge>
      </div>
      {loading && <Guardrail message="전략 로딩 중…" type="info" />}
      {error && <Guardrail message={error} type="error" />}
      {!loading && !error && items.length === 0 && (
        <Card className="border-dashed">
          <div className="py-10 text-center">
            {!mainAccountNo ? (
              <>
                <p className="text-sm font-medium text-foreground mb-1">계좌가 연결되지 않았습니다</p>
                <p className="text-sm text-muted-foreground mb-4">
                  설정에서 {market === "kr" ? "국내" : "미국"} 계좌(모의 또는 실계좌)를 연결하면 이 시장의 전략을 등록·관리할 수 있습니다.
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate(`/settings?serverType=${auth.serverType}`)}>
                  설정으로 가기
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground mb-1">시스템 적용 전략 조회</p>
                <p className="text-sm text-muted-foreground mb-4">
                  시스템이 적용한 단기/중기/장기 전략을 조회합니다. 활성/중지는 각 전략 카드에서 변경할 수 있습니다.
                </p>
                <p className="text-xs text-muted-foreground">전략 목록이 비어 있으면 새로고침해 주세요.</p>
              </>
            )}
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((s) => (
          <Card key={`${s.accountNo}-${s.strategyType}`} title={`전략 ${s.strategyType}`}>
            <div className="space-y-3">
              <p className="text-xs text-[#8b95a1]">
                {s.maxInvestmentAmount != null ? `최대 투자금: ${Number(s.maxInvestmentAmount).toLocaleString()}` : "-"}
              </p>
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#8b95a1] uppercase tracking-widest">Market</span>
                <span>{s.market || apiMarket}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#8b95a1] uppercase tracking-widest">Status</span>
                <Badge status={isStrategyEnabled(s) ? "active" : "stopped"}>
                  {s.status}
                </Badge>
              </div>
              <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  className="text-[12px] px-3 py-2"
                  onClick={() => openDetail(s.strategyType)}
                >
                  상세
                </Button>
                <Button
                  variant="secondary"
                  className="text-[12px] px-3 py-2"
                  onClick={() => handleActivate(s.strategyType)}
                  disabled={isStrategyEnabled(s)}
                >
                  Activate
                </Button>
                <Button
                  variant="danger"
                  className="text-[12px] px-3 py-2"
                  onClick={() => handleStop(s.strategyType)}
                  disabled={!isStrategyEnabled(s)}
                >
                  Stop
                </Button>
                <Button
                  variant="ghost"
                  className="text-[12px] px-3 py-2"
                  onClick={() => openEdit(s)}
                >
                  편집
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <StrategyDetailModal
        open={detailOpen}
        onOpenChange={(open) => !open && closeDetail()}
        data={detailData}
        loading={detailLoading}
        strategyType={selectedStrategyType}
        onStatusChange={handleStatusChange}
        onEdit={() => detailData && (closeDetail(), openEdit(detailData))}
      />

      <StrategyFormModal
        open={formOpen}
        onOpenChange={(open) => !open && closeForm()}
        mode={formMode}
        initial={formInitial}
        apiMarket={apiMarket}
        submitting={formSubmitting}
        setSubmitting={setFormSubmitting}
        error={formError}
        setError={setFormError}
        onSuccess={() => {
          closeForm();
          refetchList();
        }}
      />
    </div>
  );
};
