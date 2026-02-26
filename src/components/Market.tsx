import React, { useCallback, useEffect, useState } from "react";
import { Card, DataTable, Button, Input, Guardrail } from "./UI";
import { useAuth } from "@/app/AuthContext";
import { getMainAccount } from "@/api/userAccountsApi";
import { cancelOrder, cancelAllPendingOrders, getOrders, placeOrder, type OrderRequestDto } from "@/api/ordersApi";
import { getNews, collectNews, type NewsItemDto } from "@/api/newsApi";
import {
  getTodayPortfolio,
  getPortfolioByDate,
  getLatestPortfolios,
  generatePortfolio,
  getRebalanceSuggestions,
  getPortfolioDisplayDate,
  type TradingPortfolioDto,
  type TradingPortfolioItemDto,
  type RebalanceSuggestionsDto
} from "@/api/tradingPortfolioApi";
import { getSectorAnalysis, getCorrelationAnalysis, type SectorAnalysisResponseDto, type CorrelationAnalysisResponseDto } from "@/api/analysisApi";
import { getPortfolioRiskMetrics, type PortfolioRiskMetricsDto } from "@/api/riskApi";
import type { OrderResponseDto } from "@/api/ordersApi";
import { getSafeHref } from "@/utils/secureUrl";
import { analyze, type AnalysisResponseDto } from "@/api/analysisApi";
import { getCurrentPrice, searchSymbols, type CurrentPriceDto, type SymbolSearchItemDto } from "@/api/marketDataApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

/** API가 ISO 문자열 또는 배열(year,month,day,h,m,s,nano)로 줄 수 있음. 읽기 쉬운 시간 문자열로 변환. */
function formatNewsDateTime(value: string | number[] | null | undefined): string {
  if (value == null) return "-";
  if (typeof value === "string") {
    try {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? value : d.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "medium" });
    } catch {
      return value;
    }
  }
  if (Array.isArray(value) && value.length >= 6) {
    const [y, mo, d, h, mi, s] = value.map(Number);
    const month = String(mo).padStart(2, "0");
    const day = String(d).padStart(2, "0");
    const hour = String(h).padStart(2, "0");
    const min = String(mi).padStart(2, "0");
    const sec = String(s).padStart(2, "0");
    return `${y}-${month}-${day} ${hour}:${min}:${sec}`;
  }
  return "-";
}

export const News = () => {
  const [market, setMarket] = useState("");
  const [source, setSource] = useState("");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [symbol, setSymbol] = useState("");
  const [title, setTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<NewsItemDto[]>([]);
  const [collecting, setCollecting] = useState(false);
  const [collectMessage, setCollectMessage] = useState<string | null>(null);
  const [showCollectDoneModal, setShowCollectDoneModal] = useState(false);

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
    setShowCollectDoneModal(false);
    setCollecting(true);
    try {
      const res = await collectNews();
      setCollectMessage(res.message ?? "수집 요청이 완료되었습니다.");
      await load();
      setShowCollectDoneModal(true);
    } catch (e: unknown) {
      setCollectMessage(e instanceof Error ? e.message : "수집 실행에 실패했습니다.");
    } finally {
      setCollecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        아래 목록은 이미 수집된 뉴스·공시입니다. 새 데이터를 가져오려면 &quot;수집 실행&quot;을 눌러 주세요.
      </p>
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

      {/* 수집 중: 잠시만 기다려 달라는 모달 (닫기 불가) */}
      <Dialog open={collecting} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>뉴스·공시 수집 중</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">DART·SEC EDGAR 등에서 데이터를 가져오는 중입니다. 잠시만 기다려 주세요.</p>
          <div className="flex justify-center py-4">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
          </div>
        </DialogContent>
      </Dialog>

      {/* 수집 완료 알림 모달 */}
      <Dialog open={showCollectDoneModal} onOpenChange={setShowCollectDoneModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>수집 완료</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">뉴스·공시 수집이 완료되었습니다. 목록이 새로고침되었습니다.</p>
          <DialogFooter>
            <Button onClick={() => setShowCollectDoneModal(false)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && <Guardrail type="error" message={error} />}

      <Card title="시장 뉴스 및 공시 목록">
        {!loading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">
            표시할 뉴스·공시가 없습니다. &quot;수집 실행&quot;으로 DART·SEC EDGAR 등에서 데이터를 가져올 수 있습니다.
          </p>
        )}
        <DataTable
          headers={["시간", "시장", "종목", "구분", "제목", "원천"]}
          rows={rows.map((n) => [
            formatNewsDateTime(n.createdAt as string | number[] | undefined),
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

function AnalysisModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [symbol, setSymbol] = useState("");
  const [periodDays, setPeriodDays] = useState(14);
  const [currentPriceData, setCurrentPriceData] = useState<CurrentPriceDto | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponseDto | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadCurrentPrice = async () => {
    if (!symbol.trim()) return;
    setError(null);
    setLoadingPrice(true);
    try {
      const data = await getCurrentPrice(symbol.trim());
      setCurrentPriceData(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "현재가 조회에 실패했습니다.");
      setCurrentPriceData(null);
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleAnalyze = async () => {
    if (!symbol.trim()) return;
    setError(null);
    setLoadingAnalysis(true);
    setAnalysisResult(null);
    try {
      const result = await analyze({
        symbol: symbol.trim(),
        periodDays,
      });
      setAnalysisResult(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "분석에 실패했습니다.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const reset = () => {
    setSymbol("");
    setPeriodDays(14);
    setCurrentPriceData(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>종목 분석</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && <Guardrail type="error" message={error} />}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="analysis-symbol">종목 코드</Label>
              <Input
                id="analysis-symbol"
                value={symbol}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSymbol(e.target.value)}
                placeholder="005930 / AAPL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="analysis-period">분석 기간(일)</Label>
              <Input
                id="analysis-period"
                type="number"
                min={1}
                max={365}
                value={periodDays}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPeriodDays(Number(e.target.value) || 14)
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loadingPrice || !symbol.trim()}
              onClick={handleLoadCurrentPrice}
            >
              {loadingPrice ? "조회 중…" : "현재가 조회"}
            </Button>
            <Button
              type="button"
              disabled={loadingAnalysis || !symbol.trim()}
              onClick={handleAnalyze}
            >
              {loadingAnalysis ? "분석 중…" : "AI 분석"}
            </Button>
          </div>
          {currentPriceData && (
            <div className="text-sm rounded-lg bg-muted/50 p-3 space-y-1">
              <p>
                <span className="text-muted-foreground">현재가</span>{" "}
                {currentPriceData.currentPrice != null
                  ? Number(currentPriceData.currentPrice).toLocaleString()
                  : "-"}
                {currentPriceData.changeRate != null && (
                  <span className="ml-2 text-muted-foreground">
                    ({Number(currentPriceData.changeRate) >= 0 ? "+" : ""}
                    {Number(currentPriceData.changeRate).toFixed(2)}%)
                  </span>
                )}
              </p>
              {currentPriceData.name && (
                <p className="text-muted-foreground">{currentPriceData.name}</p>
              )}
            </div>
          )}
          {analysisResult && (
            <div className="text-sm rounded-lg border p-3 space-y-2">
              <p>
                <span className="font-medium">추천</span> {analysisResult.recommendation} (신뢰도:{" "}
                {(Number(analysisResult.confidence) * 100).toFixed(0)}%)
              </p>
              <p>
                <span className="text-muted-foreground">목표가</span>{" "}
                {Number(analysisResult.targetPrice).toLocaleString()} /{" "}
                <span className="text-muted-foreground">현재가</span>{" "}
                {Number(analysisResult.currentPrice).toLocaleString()} /{" "}
                <span className="text-muted-foreground">예상 수익률</span>{" "}
                {Number(analysisResult.expectedReturn).toFixed(2)}%
              </p>
              {analysisResult.reasoning && (
                <p className="text-muted-foreground border-t pt-2">{analysisResult.reasoning}</p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const Portfolio = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<TradingPortfolioDto | null>(null);
  const [latestList, setLatestList] = useState<TradingPortfolioDto[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [mainAccountNo, setMainAccountNo] = useState<string | null>(null);
  const [sectorData, setSectorData] = useState<SectorAnalysisResponseDto | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<PortfolioRiskMetricsDto | null>(null);
  const [rebalanceSuggestions, setRebalanceSuggestions] = useState<RebalanceSuggestionsDto | null>(null);
  const [correlationData, setCorrelationData] = useState<CorrelationAnalysisResponseDto | null>(null);
  const [loadingExtra, setLoadingExtra] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const st = auth.serverType === 1 ? "1" : "0";
      try {
        const main = await getMainAccount(st);
        const accNo = main?.accountNo ?? null;
        if (cancelled) return;
        setMainAccountNo(accNo);
        if (!accNo) {
          setSectorData(null);
          setRiskMetrics(null);
          setRebalanceSuggestions(null);
          setCorrelationData(null);
          return;
        }
        setLoadingExtra(true);
        const [sector, risk, rebal, corr] = await Promise.all([
          getSectorAnalysis({ accountNo: accNo }).catch(() => null),
          getPortfolioRiskMetrics(accNo).catch(() => null),
          getRebalanceSuggestions(accNo, "US").catch(() => null),
          getCorrelationAnalysis({ accountNo: accNo }).catch(() => null)
        ]);
        if (cancelled) return;
        setSectorData(sector ?? null);
        setRiskMetrics(risk ?? null);
        setRebalanceSuggestions(rebal ?? null);
        setCorrelationData(corr ?? null);
      } finally {
        if (!cancelled) setLoadingExtra(false);
      }
    })();
    return () => { cancelled = true; };
  }, [auth.serverType]);

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
      setGenerateMessage(`생성 완료: ${getPortfolioDisplayDate(res) || "완료"}`);
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
        <Button variant="secondary" onClick={() => setAnalysisModalOpen(true)}>종목 분석</Button>
      </div>
      <AnalysisModal open={analysisModalOpen} onOpenChange={setAnalysisModalOpen} />
      {generateMessage && <p className="text-sm text-muted-foreground">{generateMessage}</p>}
      {loading && <Guardrail type="info" message="포트폴리오 로딩 중…" />}
      {error && <Guardrail type="error" message={error} />}

      {!loading && (!portfolio?.items?.length) && (
        <Guardrail
          type="info"
          message="이 날짜의 트레이딩 포트폴리오(추천 종목)가 아직 없습니다. 매일 정해진 시간에 자동으로 생성되며, 위에서 '수동 생성' 버튼을 누르면 지금 바로 생성할 수 있습니다."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="자산 배분 현황" className="md:col-span-1">
          <div className="h-48 bg-[#f2f4f6] border border-dashed border-[#e5e8eb] flex items-center justify-center text-[10px] text-[#8b95a1]">
            [ ASSET ALLOCATION CHART ]
          </div>
        </Card>
        <Card title={portfolio ? `트레이딩 포트폴리오 (${getPortfolioDisplayDate(portfolio) || "해당 날짜"})` : "트레이딩 포트폴리오"} className="md:col-span-2">
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

      {mainAccountNo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="섹터 분석">
            {loadingExtra ? (
              <p className="text-sm text-muted-foreground">로딩 중…</p>
            ) : sectorData?.sectors?.length ? (
              <DataTable
                headers={["섹터", "비중(%)", "평가액", "수익률(%)"]}
                rows={(sectorData.sectors ?? []).map((s) => [
                  String(s.sectorName ?? s.sectorCode ?? "-"),
                  s.weightPct != null ? Number(s.weightPct).toFixed(2) : "-",
                  s.notionalValue != null ? Number(s.notionalValue).toLocaleString() : "-",
                  s.returnPct != null ? Number(s.returnPct).toFixed(2) : "-"
                ])}
              />
            ) : (
              <p className="text-sm text-muted-foreground">보유 종목이 없거나 섹터 데이터가 없습니다.</p>
            )}
          </Card>
          <Card title="포트폴리오 리스크 메트릭">
            {loadingExtra ? (
              <p className="text-sm text-muted-foreground">로딩 중…</p>
            ) : riskMetrics ? (
              <div className="text-sm space-y-2">
                <p><span className="text-muted-foreground">평가액</span> {riskMetrics.currentValue != null ? Number(riskMetrics.currentValue).toLocaleString() : "-"}</p>
                <p><span className="text-muted-foreground">MDD</span> {riskMetrics.mddPct != null ? `${(Number(riskMetrics.mddPct) * 100).toFixed(2)}%` : "-"}</p>
                <p><span className="text-muted-foreground">VaR 95%</span> {riskMetrics.var95Pct != null ? `${Number(riskMetrics.var95Pct).toFixed(2)}%` : "-"}</p>
                <p><span className="text-muted-foreground">CVaR 95%</span> {riskMetrics.cvar95Pct != null ? `${Number(riskMetrics.cvar95Pct).toFixed(2)}%` : "-"}</p>
                {(riskMetrics.sharpeRatio != null || riskMetrics.sortinoRatio != null) && (
                  <p><span className="text-muted-foreground">Sharpe</span> {riskMetrics.sharpeRatio != null ? Number(riskMetrics.sharpeRatio).toFixed(2) : "-"} / <span className="text-muted-foreground">Sortino</span> {riskMetrics.sortinoRatio != null ? Number(riskMetrics.sortinoRatio).toFixed(2) : "-"}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">계좌 리스크 메트릭을 불러올 수 없습니다.</p>
            )}
          </Card>
          <Card title="리밸런싱 제안 (US)">
            {loadingExtra ? (
              <p className="text-sm text-muted-foreground">로딩 중…</p>
            ) : rebalanceSuggestions?.items?.length ? (
              <DataTable
                headers={["종목", "방향", "금액"]}
                rows={(rebalanceSuggestions.items ?? []).map((i) => [
                  String(i.symbol ?? "-"),
                  String(i.side ?? "-"),
                  i.notional != null ? Number(i.notional).toLocaleString() : "-"
                ])}
              />
            ) : (
              <p className="text-sm text-muted-foreground">제안이 없거나 US 시장만 지원됩니다.</p>
            )}
          </Card>
          <Card title="상관관계 (수익률)">
            {loadingExtra ? (
              <p className="text-sm text-muted-foreground">로딩 중…</p>
            ) : correlationData?.symbols?.length && correlationData?.matrix?.length ? (
              <div className="overflow-x-auto">
                <DataTable
                  headers={["", ...(correlationData.symbols ?? [])]}
                  rows={(correlationData.matrix ?? []).map((row, i) => [
                    String(correlationData.symbols?.[i] ?? "-"),
                    ...(row.map((v) => (typeof v === "number" ? v.toFixed(2) : String(v))))
                  ])}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">보유 종목 2개 이상·20일 이상 데이터가 필요합니다.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

/** 수동 주문용 종목 통합 검색 모달. 검색 후 선택 시 onSelect(symbol, name, market) 호출. */
function StockSearchModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (symbol: string, name: string, market: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolSearchItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setLoading(true);
      searchSymbols({ q: query.trim() || undefined, market: "" })
        .then((list) => setResults(list ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, query.trim() ? 300 : 0);
    return () => clearTimeout(t);
  }, [open, query]);

  const handleSelect = (item: SymbolSearchItemDto) => {
    const symbol = item.symbol ?? "";
    const name = item.name ?? symbol;
    const market = item.market ?? "KR";
    onSelect(symbol, name, market);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>종목 검색</DialogTitle>
        </DialogHeader>
        <input
          type="text"
          className="w-full border border-gray-300 p-2 text-sm rounded mb-2"
          placeholder="종목명 또는 종목코드 검색..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="flex-1 overflow-y-auto min-h-[200px] border border-gray-200 rounded">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">검색 중…</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">검색어를 입력하거나 목록에서 종목을 선택하세요.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {results.map((item) => (
                <li
                  key={`${item.market ?? ""}-${item.symbol ?? ""}`}
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                  onClick={() => handleSelect(item)}
                  onKeyDown={(e) => e.key === "Enter" && handleSelect(item)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="font-medium">{item.name ?? item.symbol ?? "-"}</span>
                  <span className="text-muted-foreground text-xs">{item.symbol} · {item.market ?? "KR"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const Orders = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountNo, setAccountNo] = useState<string | null>(null);
  const [items, setItems] = useState<OrderResponseDto[]>([]);
  /** 주문 시 사용할 종목 코드 (API 전달용) */
  const [orderSymbol, setOrderSymbol] = useState("");
  /** 화면 표시용 종목 명칭 */
  const [orderSymbolName, setOrderSymbolName] = useState("");
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [orderMarket, setOrderMarket] = useState("KR");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [cancellingAll, setCancellingAll] = useState(false);
  const [stockSearchOpen, setStockSearchOpen] = useState(false);

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
      setOrderSymbolName("");
      setOrderQuantity("");
      setOrderPrice("");
      await load();
    } catch (e: unknown) {
      setOrderError(e instanceof Error ? e.message : "주문에 실패했습니다.");
    } finally {
      setPlacing(false);
    }
  };

  const handleCancelAllPending = async () => {
    if (!accountNo) return;
    if (!window.confirm("해당 계좌의 미체결 주문을 모두 취소합니다. 계속할까요?")) return;
    setOrderError(null);
    setOrderSuccess(null);
    setCancellingAll(true);
    try {
      const res = await cancelAllPendingOrders(accountNo);
      setOrderSuccess(res.cancelledCount > 0 ? `미체결 ${res.cancelledCount}건 취소되었습니다.` : "취소할 미체결 주문이 없습니다.");
      await load();
    } catch (e: unknown) {
      setOrderError(e instanceof Error ? e.message : "미체결 전체 취소에 실패했습니다.");
    } finally {
      setCancellingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {accountNo && (
        <Card title="수동 주문">
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
            {orderSuccess && <div className="col-span-full text-sm text-green-600">{orderSuccess}</div>}
            {orderError && <div className="col-span-full text-sm text-red-600">{orderError}</div>}
            <div>
              <label className="block text-[11px] font-bold text-[#8b95a1] uppercase mb-1">종목</label>
              <button
                type="button"
                onClick={() => setStockSearchOpen(true)}
                className="w-full border border-gray-300 p-2 text-sm rounded text-left bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <span className={orderSymbolName || orderSymbol ? "text-foreground" : "text-muted-foreground"}>
                  {orderSymbolName || orderSymbol || "종목 검색 후 선택"}
                </span>
                <span className="text-xs text-muted-foreground">{orderSymbol ? `${orderSymbol} · ${orderMarket}` : ""}</span>
              </button>
            </div>
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
          <StockSearchModal
            open={stockSearchOpen}
            onOpenChange={setStockSearchOpen}
            onSelect={(symbol, name, market) => {
              setOrderSymbol(symbol);
              setOrderSymbolName(name);
              setOrderMarket(market);
            }}
          />
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="secondary" className="text-xs" disabled>전체</Button>
        </div>
        <Button
          variant="secondary"
          className="text-xs"
          disabled={!accountNo || loading || cancellingAll}
          onClick={handleCancelAllPending}
        >
          {cancellingAll ? "취소 중…" : "미체결 전체 취소"}
        </Button>
      </div>

      {error && <Guardrail type="error" message={error} />}

      <Card title="주문 및 체결 내역">
        <DataTable
          headers={["주문시간", "종목", "구분", "가격", "수량", "상태", "시그널 유형", "청산 규칙", "관리"]}
          rows={items.map((o) => [
            String(o.orderTime ?? "-"),
            String(o.symbol ?? "-"),
            String(o.orderType ?? "-"),
            String(o.price ?? "-"),
            String(o.quantity ?? "-"),
            String(o.status ?? "-"),
            String(o.signalType ?? "-"),
            String(o.exitRuleType ?? "-"),
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
