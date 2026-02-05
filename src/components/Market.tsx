import React, { useCallback, useEffect, useState } from "react";
import { Card, DataTable, Button, Input, Guardrail } from "./UI";
import { useAuth } from "@/app/AuthContext";
import { getMainAccount } from "@/api/userAccountsApi";
import { cancelOrder, getOrders } from "@/api/ordersApi";
import { getNews, type NewsItemDto } from "@/api/newsApi";
import { getTodayPortfolio, type TradingPortfolioDto, type TradingPortfolioItemDto } from "@/api/tradingPortfolioApi";
import type { OrderResponseDto } from "@/api/ordersApi";
import { getSafeHref } from "@/utils/secureUrl";

export const News = () => {
  const [market, setMarket] = useState("");
  const [source, setSource] = useState("");
  const [from, setFrom] = useState("");
  const [symbol, setSymbol] = useState("");
  const [title, setTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<NewsItemDto[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNews({ market, source, from, symbol, title, page: 0, size: 20 });
      setRows(res.content ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "뉴스 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [market, source, from, symbol, title]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-4 rounded-2xl border border-[#f2f4f6]">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
          <Input label="원천" placeholder="DART/SEC_EDGAR..." value={source} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSource(e.target.value)} />
          <Input label="시장" placeholder="KR/US" value={market} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMarket(e.target.value)} />
          <Input label="시작일" type="date" value={from} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFrom(e.target.value)} />
          <Input label="종목" placeholder="AAPL..." value={symbol} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSymbol(e.target.value)} />
          <Input label="제목" placeholder="키워드..." value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
        </div>
        <Button disabled={loading} onClick={load}>필터 적용</Button>
      </div>

      {error && <Guardrail type="error" message={error} />}

      <Card title="시장 뉴스 및 공시 목록">
        <DataTable
          headers={["시간", "시장", "종목", "구분", "제목", "원천"]}
          rows={rows.map((n) => [
            String(n.createdAt ?? "-"),
            String(n.market ?? "-"),
            String(n.symbol ?? "-"),
            String(n.itemType ?? "-"),
            (() => {
              const safeHref = getSafeHref(n.url);
              if (safeHref) {
                return (
                  <a className="underline" href={safeHref} target="_blank" rel="noopener noreferrer">
                    {n.title}
                  </a>
                );
              }
              return String(n.title ?? "-");
            })(),
            String(n.source ?? "-")
          ])}
        />
      </Card>
    </div>
  );
};

export const Portfolio = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<TradingPortfolioDto | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getTodayPortfolio();
        if (mounted) setPortfolio(res);
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : "포트폴리오 조회에 실패했습니다.");
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
          <div className="h-48 bg-[#f2f4f6] border border-dashed border-[#e5e8eb] flex items-center justify-center text-[10px] text-[#8b95a1]">
            [ ASSET ALLOCATION CHART ]
          </div>
        </Card>
        <Card title="트레이딩 포트폴리오 (Today)" className="md:col-span-2">
          <DataTable
            headers={["종목", "시장", "진입가", "목표가", "손절가", "사유"]}
            rows={(portfolio?.items ?? []).map((it: TradingPortfolioItemDto) => [
              String(it.symbol ?? "-"),
              String(it.market ?? "-"),
              String(it.entryPrice ?? "-"),
              String(it.targetPrice ?? "-"),
              String(it.stopLossPrice ?? "-"),
              String(it.reason ?? "-")
            ])}
          />
        </Card>
      </div>

      <Card title="리스크 관리 전략">
        <div className="text-[13px] whitespace-pre-wrap text-[#8b95a1]">
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
  const [items, setItems] = useState<OrderResponseDto[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
      setAccountNo(main?.accountNo ?? null);
      const list = main ? await getOrders(main.accountNo) : [];
      setItems(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "주문 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [auth.serverType]);

  useEffect(() => {
    load();
  }, [load]);

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
          rows={items.map((o) => [
            String(o.orderTime ?? "-"),
            String(o.symbol ?? "-"),
            String(o.orderType ?? "-"),
            String(o.price ?? "-"),
            String(o.quantity ?? "-"),
            String(o.status ?? "-"),
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
          getRowKey={(_, i) => `order-${items[i]?.orderId ?? i}`}
        />
      </Card>
    </div>
  );
};
