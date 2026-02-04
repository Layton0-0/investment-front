import React, { useEffect, useState } from "react";
import { Card, DataTable, Button, Input, Guardrail } from "./UI";
import { useAuth } from "../src/app/AuthContext";
import { getMainAccount } from "../src/api/userAccountsApi";
import { cancelOrder, getOrders } from "../src/api/ordersApi";
import { getNews } from "../src/api/newsApi";
import { getTodayPortfolio } from "../src/api/tradingPortfolioApi";

export const News = () => {
  const [market, setMarket] = useState("");
  const [source, setSource] = useState("");
  const [from, setFrom] = useState("");
  const [symbol, setSymbol] = useState("");
  const [title, setTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNews({ market, source, from, symbol, title, page: 0, size: 20 });
      setRows(res.content || []);
    } catch (e: any) {
      setError(e?.message || "뉴스 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-4 border border-gray-200 rounded-2xl">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
          <Input label="원천" placeholder="DART/SEC_EDGAR..." value={source} onChange={(e: any) => setSource(e.target.value)} />
          <Input label="시장" placeholder="KR/US" value={market} onChange={(e: any) => setMarket(e.target.value)} />
          <Input label="시작일" type="date" value={from} onChange={(e: any) => setFrom(e.target.value)} />
          <Input label="종목" placeholder="AAPL..." value={symbol} onChange={(e: any) => setSymbol(e.target.value)} />
          <Input label="제목" placeholder="키워드..." value={title} onChange={(e: any) => setTitle(e.target.value)} />
        </div>
        <Button disabled={loading} onClick={load}>필터 적용</Button>
      </div>

      {error && <Guardrail type="error" message={error} />}

      <Card title="시장 뉴스 및 공시 목록">
        <DataTable
          headers={["시간", "시장", "종목", "구분", "제목", "원천"]}
          rows={(rows || []).map((n: any) => [
            String(n.createdAt || "-"),
            String(n.market || "-"),
            String(n.symbol || "-"),
            String(n.itemType || "-"),
            n.url ? (
              <a className="underline" href={n.url} target="_blank" rel="noreferrer">
                {n.title}
              </a>
            ) : (
              String(n.title || "-")
            ),
            String(n.source || "-")
          ])}
        />
      </Card>
    </div>
  );
};

export const Portfolio = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getTodayPortfolio();
        if (mounted) setPortfolio(res);
      } catch (e: any) {
        if (mounted) setError(e?.message || "포트폴리오 조회에 실패했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {loading && <Guardrail type="info" message="포트폴리오 로딩 중…" />}
      {error && <Guardrail type="error" message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="자산 배분 현황" className="md:col-span-1">
          <div className="h-48 bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400">
            [ ASSET ALLOCATION CHART ]
          </div>
        </Card>
        <Card title="트레이딩 포트폴리오 (Today)" className="md:col-span-2">
          <DataTable
            headers={["종목", "시장", "진입가", "목표가", "손절가", "사유"]}
            rows={(portfolio?.items || []).map((it: any) => [
              String(it.symbol || "-"),
              String(it.market || "-"),
              String(it.entryPrice || "-"),
              String(it.targetPrice || "-"),
              String(it.stopLossPrice || "-"),
              String(it.reason || "-")
            ])}
          />
        </Card>
      </div>

      <Card title="리스크 관리 전략">
        <div className="text-[13px] text-[#4e5968] whitespace-pre-wrap">
          {portfolio?.riskManagementStrategy || "N/A"}
        </div>
      </Card>
    </div>
  );
};

export const Orders = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountNo, setAccountNo] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
      setAccountNo(main.accountNo);
      const list = await getOrders(main.accountNo);
      setItems(list || []);
    } catch (e: any) {
      setError(e?.message || "주문 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.serverType]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="secondary" className="text-xs" disabled>
            전체
          </Button>
        </div>
        <Button variant="secondary" className="text-xs" disabled>
          미체결 전체 취소(준비중)
        </Button>
      </div>

      {error && <Guardrail type="error" message={error} />}

      <Card title="주문 및 체결 내역">
        <DataTable
          headers={["주문시간", "종목", "구분", "가격", "수량", "상태", "관리"]}
          rows={(items || []).map((o: any) => [
            String(o.orderTime || "-"),
            String(o.symbol || "-"),
            String(o.orderType || "-"),
            String(o.price || "-"),
            String(o.quantity ?? "-"),
            String(o.status || "-"),
            o.status === "PENDING" && accountNo ? (
              <Button
                variant="ghost"
                className="text-red-600 text-[10px] p-0 underline"
                disabled={loading}
                onClick={async () => {
                  await cancelOrder(o.orderId, accountNo);
                  await load();
                }}
              >
                취소
              </Button>
            ) : (
              "-"
            )
          ])}
        />
      </Card>
    </div>
  );
};
