import React, { useCallback, useEffect, useState } from "react";
import { Card, DataTable, Button, Input, Guardrail } from "./UI";
import { useAuth } from "@/app/AuthContext";
import { getMainAccount } from "@/api/userAccountsApi";
import { cancelOrder, getOrders, placeOrder, type OrderRequestDto } from "@/api/ordersApi";
import { getNews, collectNews, type NewsItemDto } from "@/api/newsApi";
import {
  getTodayPortfolio,
  getPortfolioByDate,
  getLatestPortfolios,
  generatePortfolio,
  type TradingPortfolioDto,
  type TradingPortfolioItemDto
} from "@/api/tradingPortfolioApi";
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
  const [collecting, setCollecting] = useState(false);
  const [collectMessage, setCollectMessage] = useState<string | null>(null);

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

  const handleCollect = async () => {
    setCollectMessage(null);
    setCollecting(true);
    try {
      const res = await collectNews();
      setCollectMessage(res.message ?? "수집 요청이 완료되었습니다.");
      await load();
    } catch (e: unknown) {
      setCollectMessage(e instanceof Error ? e.message : "수집 실행에 실패했습니다.");
    } finally {
      setCollecting(false);
    }
  };

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
        <Button variant="secondary" disabled={collecting} onClick={handleCollect}>수집 실행</Button>
      </div>
      {collectMessage && <p className="text-sm text-muted-foreground">{collectMessage}</p>}

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
  const [latestList, setLatestList] = useState<TradingPortfolioDto[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const loadToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTodayPortfolio();
      setPortfolio(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "포트폴리오 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const loadByDate = async () => {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getPortfolioByDate(selectedDate);
      setPortfolio(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "포트폴리오 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadLatest = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getLatestPortfolios(10);
      setLatestList(list);
      if (list.length > 0) setPortfolio(list[0]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "최신 목록 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerateMessage(null);
    setGenerating(true);
    try {
      const res = await generatePortfolio(selectedDate || undefined);
      setPortfolio(res);
      setGenerateMessage(`생성 완료: ${res.date}`);
    } catch (e: unknown) {
      setGenerateMessage(e instanceof Error ? e.message : "생성에 실패했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-end">
        <Input label="날짜 조회" type="date" value={selectedDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)} />
        <Button variant="secondary" disabled={loading} onClick={loadByDate}>날짜별 조회</Button>
        <Button variant="secondary" disabled={loading} onClick={loadLatest}>최신 목록</Button>
        <Button variant="secondary" disabled={generating} onClick={handleGenerate}>수동 생성</Button>
      </div>
      {generateMessage && <p className="text-sm text-muted-foreground">{generateMessage}</p>}
      {loading && <Guardrail type="info" message="포트폴리오 로딩 중…" />}
      {error && <Guardrail type="error" message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="자산 배분 현황" className="md:col-span-1">
          <div className="h-48 bg-[#f2f4f6] border border-dashed border-[#e5e8eb] flex items-center justify-center text-[10px] text-[#8b95a1]">
            [ ASSET ALLOCATION CHART ]
          </div>
        </Card>
        <Card title={portfolio ? `트레이딩 포트폴리오 (${portfolio.date})` : "트레이딩 포트폴리오"} className="md:col-span-2">
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
  const [orderSymbol, setOrderSymbol] = useState("");
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [orderMarket, setOrderMarket] = useState("KR");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    setOrderSuccess(null);
    if (!accountNo || !orderSymbol.trim() || !orderQuantity || !orderPrice) {
      setOrderError("계좌·종목·수량·가격을 입력하세요.");
      return;
    }
    const qty = Number(orderQuantity);
    const price = Number(orderPrice);
    if (!(qty > 0 && price > 0)) {
      setOrderError("수량과 가격은 양수여야 합니다.");
      return;
    }
    setPlacing(true);
    try {
      const req: OrderRequestDto = {
        accountNo,
        symbol: orderSymbol.trim(),
        orderType,
        quantity: qty,
        price,
        market: orderMarket || "KR"
      };
      await placeOrder(req);
      setOrderSuccess("주문 요청되었습니다.");
      setOrderSymbol("");
      setOrderQuantity("");
      setOrderPrice("");
      await load();
    } catch (e: unknown) {
      setOrderError(e instanceof Error ? e.message : "주문에 실패했습니다.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="space-y-6">
      {accountNo && (
        <Card title="수동 주문">
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
            {orderSuccess && <div className="col-span-full text-sm text-green-600">{orderSuccess}</div>}
            {orderError && <div className="col-span-full text-sm text-red-600">{orderError}</div>}
            <Input label="종목" value={orderSymbol} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderSymbol(e.target.value)} placeholder="005930" />
            <div>
              <label className="block text-[11px] font-bold text-[#8b95a1] uppercase mb-1">구분</label>
              <select className="w-full border border-gray-300 p-2 text-sm rounded" value={orderType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOrderType(e.target.value as "BUY" | "SELL")}>
                <option value="BUY">매수</option>
                <option value="SELL">매도</option>
              </select>
            </div>
            <Input label="수량" type="number" value={orderQuantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderQuantity(e.target.value)} placeholder="1" />
            <Input label="가격" type="number" value={orderPrice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderPrice(e.target.value)} placeholder="70000" />
            <div>
              <label className="block text-[11px] font-bold text-[#8b95a1] uppercase mb-1">시장</label>
              <select className="w-full border border-gray-300 p-2 text-sm rounded" value={orderMarket} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOrderMarket(e.target.value)}>
                <option value="KR">KR</option>
                <option value="US">US</option>
              </select>
            </div>
            <Button type="submit" disabled={placing}>주문</Button>
          </form>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="secondary" className="text-xs" disabled>전체</Button>
        </div>
        <Button variant="secondary" className="text-xs" disabled>미체결 전체 취소(준비중)</Button>
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
