import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, DataTable, Badge, Stat, Guardrail } from "./UI";
import { getMainAccount } from "../src/api/userAccountsApi";
import { getAccountAssets, getPositions } from "../src/api/accountApi";
import { getOrders } from "../src/api/ordersApi";

export const Dashboard = ({ serverType, hasAccount, onNavigate }: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [virtual, setVirtual] = useState<any>(null);
  const [real, setReal] = useState<any>(null);

  const [virtualAssets, setVirtualAssets] = useState<any>(null);
  const [realAssets, setRealAssets] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [vMain, rMain] = await Promise.all([
          getMainAccount("1").catch(() => null),
          getMainAccount("0").catch(() => null)
        ]);

        if (!mounted) return;
        setVirtual(vMain);
        setReal(rMain);

        const vNo = vMain?.accountNo;
        const rNo = rMain?.accountNo;

        const [vAssets, rAssets, vPos, rPos, vOrders, rOrders] = await Promise.all([
          vNo ? getAccountAssets(vNo).catch(() => null) : Promise.resolve(null),
          rNo ? getAccountAssets(rNo).catch(() => null) : Promise.resolve(null),
          vNo ? getPositions(vNo).catch(() => []) : Promise.resolve([]),
          rNo ? getPositions(rNo).catch(() => []) : Promise.resolve([]),
          vNo ? getOrders(vNo).catch(() => []) : Promise.resolve([]),
          rNo ? getOrders(rNo).catch(() => []) : Promise.resolve([])
        ]);

        if (!mounted) return;
        setVirtualAssets(vAssets);
        setRealAssets(rAssets);
        setPositions([...(vPos || []), ...(rPos || [])]);
        setRecentOrders([...(vOrders || []), ...(rOrders || [])].slice(0, 10));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "대시보드 로딩에 실패했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const effectiveHasAccount = hasAccount && (!!virtual || !!real);

  if (!effectiveHasAccount && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">?</div>
        <h2 className="text-xl font-bold">등록된 계좌가 없습니다</h2>
        <p className="text-gray-500 max-w-md">
          투자를 시작하려면 설정 메뉴에서 {serverType === 1 ? "모의계좌" : "실계좌"} API 연동을
          완료해주세요.
        </p>
        <Button onClick={() => onNavigate("/settings")}>계좌 설정하러 가기</Button>
      </div>
    );
  }

  const statsVirtual = useMemo(() => {
    if (!virtualAssets) return [];
    const total = Number(virtualAssets.totalAssetValue || 0);
    const rr = Number(virtualAssets.totalProfitLossRate || 0);
    return [
      {
        label: "모의 총 자산",
        value: `₩${total.toLocaleString("ko-KR")}`,
        trend: rr >= 0 ? "positive" : "negative"
      },
      {
        label: "모의 수익률",
        value: `${rr >= 0 ? "+" : ""}${rr}%`,
        trend: rr >= 0 ? "positive" : "negative"
      }
    ];
  }, [virtualAssets]);

  const statsReal = useMemo(() => {
    if (!realAssets) return [];
    const total = Number(realAssets.totalAssetValue || 0);
    const rr = Number(realAssets.totalProfitLossRate || 0);
    return [
      {
        label: "실계좌 총 자산",
        value: `₩${total.toLocaleString("ko-KR")}`,
        trend: rr >= 0 ? "positive" : "negative"
      },
      {
        label: "실계좌 수익률",
        value: `${rr >= 0 ? "+" : ""}${rr}%`,
        trend: rr >= 0 ? "positive" : "negative"
      }
    ];
  }, [realAssets]);

  return (
    <div className="space-y-6">
      {loading && <Guardrail message="대시보드 로딩 중…" type="info" />}
      {error && <Guardrail message={error} type="error" />}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {['국내전략', '미국전략', '뉴스·이벤트', '포트폴리오', '주문·체결', '설정'].map((item, idx) => (
          <button 
            key={idx} 
            onClick={() => {
              const routes: any = { '국내전략': '/strategies/kr', '미국전략': '/strategies/us', '뉴스·이벤트': '/news', '포트폴리오': '/portfolio', '주문·체결': '/orders', '설정': '/settings' };
              onNavigate(routes[item]);
            }}
            className="p-6 bg-white rounded-2xl shadow-[0_8px_24px_rgba(149,157,165,0.05)] hover:shadow-[0_8px_24px_rgba(149,157,165,0.12)] transition-all text-left flex flex-col justify-between h-32 group"
          >
            <span className="text-[13px] font-bold text-[#3182f6] opacity-50 group-hover:opacity-100 transition-opacity">0{idx + 1}</span>
            <span className="text-[15px] font-bold text-[#191f28]">{item}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="모의계좌 요약 (Virtual)">
          <div className="grid grid-cols-2 gap-4">
            {statsVirtual.map((s: any, i: number) => (
              <Stat key={i} {...(s as any)} />
            ))}
            <div className="col-span-2 mt-2 p-4 bg-[#f2f4f6] rounded-xl flex justify-between items-center">
              <Badge status="active">AUTO-TRADING ON</Badge>
              <span className="text-[12px] text-[#4e5968] font-bold">KR 120 / US 80</span>
            </div>
          </div>
        </Card>
        <Card title="실계좌 요약 (Real)">
          <div className="grid grid-cols-2 gap-4">
            {statsReal.map((s: any, i: number) => (
              <Stat key={i} {...(s as any)} />
            ))}
            <div className="col-span-2 mt-2 p-4 bg-[#f2f4f6] rounded-xl flex justify-between items-center">
              <Badge status="stopped">AUTO-TRADING OFF</Badge>
              <span className="text-[12px] text-[#4e5968] font-bold">KR 0 / US 0</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="보유 잔고 (Top 5)">
          <DataTable 
            headers={['종목', '수량', '평균단가', '현재가', '수익률']}
            rows={positions
              .slice(0, 5)
              .map((p: any) => [
                `${p.name || p.symbol}`,
                String(p.quantity ?? "-"),
                String(p.averagePrice ?? "-"),
                String(p.currentPrice ?? "-"),
                `${Number(p.profitLossRate || 0) >= 0 ? "+" : ""}${p.profitLossRate ?? "-"}%`
              ])}
          />
        </Card>

        <Card title="최근 주문 현황">
          <DataTable 
            headers={['시간', '종목', '구분', '가격', '상태']}
            rows={recentOrders.slice(0, 5).map((o: any) => [
              String(o.orderTime || "-"),
              String(o.symbol || "-"),
              String(o.orderType || "-"),
              String(o.price || "-"),
              String(o.status || "-")
            ])}
          />
        </Card>
      </div>

      <Guardrail message="현재 서버는 Dry-Run 모드입니다. 실제 주문은 서버 설정(PIPELINE_AUTO_EXECUTE)이 필요합니다." type="info" />
    </div>
  );
};
