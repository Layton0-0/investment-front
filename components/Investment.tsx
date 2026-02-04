import React, { useEffect, useMemo, useState } from "react";
import { Card, DataTable, Badge, Button, Guardrail } from "./UI";
import { useAuth } from "../src/app/AuthContext";
import { getMainAccount } from "../src/api/userAccountsApi";
import { getPipelineSummary } from "../src/api/pipelineApi";
import { getSignals } from "../src/api/signalsApi";
import { activateStrategy, getStrategies, stopStrategy } from "../src/api/strategyApi";

export const AutoInvest = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [signals, setSignalsState] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
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

        const combined = [
          ...(krSignals?.content || []).map((x: any) => ({ ...x, market: "KR" })),
          ...(usSignals?.content || []).map((x: any) => ({ ...x, market: "US" }))
        ];
        setSignalsState(combined.slice(0, 20));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "자동투자 현황 조회에 실패했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [auth.serverType]);

  return (
    <div className="space-y-6">
      {loading && <Guardrail message="자동투자 현황 로딩 중…" type="info" />}
      {error && <Guardrail message={error} type="error" />}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="01. 유니버스">
          <div className="text-center py-4">
            <div className="text-2xl font-mono font-bold">
              {summary?.universeCountKr ?? "-"} / {summary?.universeCountUs ?? "-"}
            </div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">KR / US ITEMS</div>
          </div>
        </Card>
        <Card title="02. 시그널">
          <div className="text-center py-4">
            <div className="text-2xl font-mono font-bold">
              {summary?.signalCountKr ?? "-"} / {summary?.signalCountUs ?? "-"}
            </div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">BUY SIGNALS</div>
          </div>
        </Card>
        <Card title="03. 자금관리">
          <div className="text-center py-4">
            <div className="text-[14px] font-mono font-bold">
              {summary?.allocationSummary || "준비 중"}
            </div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">ALLOCATION / CASH</div>
          </div>
        </Card>
        <Card title="04. 매매실행">
          <div className="text-center py-4">
            <div className="text-2xl font-mono font-bold">{summary?.openPositionCount ?? "-"}</div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">OPEN POSITIONS</div>
          </div>
        </Card>
      </div>

      <Card title="실시간 시그널 발생 내역">
        <DataTable 
          headers={['시간', '시장', '종목', '전략', '시그널', '강도']}
          rows={signals.map((s: any) => [
            String(s.basDt || "-"),
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
          headers={['종목', '진입일', '수량', '진입가', '현재가', '상태']}
          rows={[]}
        />
      </Card>

      <Guardrail message="신규 매수 축소/중단: 리스크 게이트 발동 (일일 손실 한도 근접)" type="error" />
    </div>
  );
};

export const Strategy = ({ market }: { market: 'kr' | 'us' }) => (
  <StrategyInner market={market} />
);

const StrategyInner = ({ market }: { market: "kr" | "us" }) => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const apiMarket = market === "kr" ? "KR" : "US";

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
        const list = await getStrategies(main.accountNo, apiMarket as any);
        if (!mounted) return;
        setItems(list || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "전략 목록 조회에 실패했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [auth.serverType, market]);

  const handleActivate = async (strategyType: string) => {
    const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
    await activateStrategy(main.accountNo, strategyType, apiMarket as any);
    const list = await getStrategies(main.accountNo, apiMarket as any);
    setItems(list || []);
  };

  const handleStop = async (strategyType: string) => {
    const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
    await stopStrategy(main.accountNo, strategyType, apiMarket as any);
    const list = await getStrategies(main.accountNo, apiMarket as any);
    setItems(list || []);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold uppercase">
          {market === "kr" ? "국내" : "미국"} 전략 목록
        </h2>
        <Badge status="active">SYSTEM ACTIVE</Badge>
      </div>
      {loading && <Guardrail message="전략 로딩 중…" type="info" />}
      {error && <Guardrail message={error} type="error" />}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((s: any) => (
          <Card key={`${s.accountNo}-${s.strategyType}`} title={`전략 ${s.strategyType}`}>
            <div className="space-y-3">
              <p className="text-xs text-gray-500">{s.description || "-"}</p>
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-widest">Market</span>
                <span>{s.market || apiMarket}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-widest">Status</span>
                <Badge status={s.enabled ? "active" : "stopped"}>
                  {s.enabled ? "ACTIVE" : "STOPPED"}
                </Badge>
              </div>
              <div className="pt-2 border-t border-gray-100 flex gap-2">
                <Button
                  variant="secondary"
                  className="text-[12px] px-3 py-2"
                  onClick={() => handleActivate(s.strategyType)}
                  disabled={!!s.enabled}
                >
                  Activate
                </Button>
                <Button
                  variant="danger"
                  className="text-[12px] px-3 py-2"
                  onClick={() => handleStop(s.strategyType)}
                  disabled={!s.enabled}
                >
                  Stop
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
