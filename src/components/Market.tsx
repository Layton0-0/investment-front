import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, DataTable, Button, Input, Guardrail } from "./UI";
import { useAuth } from "@/app/AuthContext";
import { getMainAccount } from "@/api/userAccountsApi";
import { cancelAllPendingOrders, getOrders, placeOrder, type OrderRequestDto } from "@/api/ordersApi";
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
import { ApiError } from "@/api/http";
import { getCurrentPrice, searchSymbols, type CurrentPriceDto, type SymbolSearchItemDto } from "@/api/marketDataApi";
import { getPositions, getOrderHistory, type AccountPositionDto, type OrderHistoryItemDto } from "@/api/accountApi";
import { getTaxSummary, type TaxReportSummaryDto } from "@/api/reportApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** 뉴스·공시 필터용 원천 옵션 (백엔드 source 파라미터 값). KRX 포함. */
const NEWS_SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "전체" },
  { value: "DART", label: "DART" },
  { value: "SEC_EDGAR", label: "SEC EDGAR" },
  { value: "KRX", label: "KRX" },
  { value: "YAHOO_FINANCE", label: "Yahoo Finance" },
  { value: "YONHAP", label: "연합" },
];

/** 뉴스·공시 필터용 시장 옵션. */
const NEWS_MARKET_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "전체" },
  { value: "KR", label: "KR" },
  { value: "US", label: "US" },
];

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

/** 주문/체결 시간: 초 단위까지 가독성 있게 (yyyy-MM-dd HH:mm:ss). */
function formatOrderTime(value: string | null | undefined): string {
  if (value == null) return "-";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${y}-${mo}-${day} ${h}:${min}:${s}`;
  } catch {
    return String(value);
  }
}

/** 가격 포맷: 통화 표시, 콤마, 주당/총액. market KR → 원, US → $. */
function formatOrderPrice(
  pricePerShare: string | number | null | undefined,
  totalAmount: string | number | null | undefined,
  market: string | null | undefined
): string {
  const isUs = market === "US";
  const currency = isUs ? "USD" : "KRW";
  const sym = isUs ? "$" : "";
  const suffix = isUs ? "" : "원";
  const fmt = (v: string | number | null | undefined): string => {
    if (v == null || v === "") return "-";
    const n = typeof v === "string" ? parseFloat(v) : v;
    if (Number.isNaN(n)) return String(v);
    const s = Math.round(n) === n ? String(n) : n.toFixed(2);
    const parts = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${sym}${parts}${suffix}`;
  };
  const per = fmt(pricePerShare);
  const total = fmt(totalAmount);
  if (per === "-" && total === "-") return "-";
  if (per === "-" || total === "-") return per !== "-" ? `${per} (주당)` : `${total} (총액)`;
  return `${per} (주당) / ${total} (총액)`;
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
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [collecting, setCollecting] = useState(false);
  const [collectMessage, setCollectMessage] = useState<string | null>(null);
  const [showCollectDoneModal, setShowCollectDoneModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNews({ market, source, from, symbol, title, page, size: pageSize });
      setRows(res.content ?? []);
      const meta = res.page;
      setTotalElements(meta?.totalElements ?? 0);
      setTotalPages(meta?.totalPages ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "뉴스 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [market, source, from, symbol, title, page, pageSize]);

  useEffect(() => {
    setPage(0);
  }, [market, source, from, symbol, title]);

  useEffect(() => {
    load();
  }, [load]);

  const goToPrevPage = () => setPage((p) => Math.max(0, p - 1));
  const goToNextPage = () => setPage((p) => Math.min(totalPages - 1, p + 1));

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
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">원천</Label>
            <Select value={source === "" ? "__all__" : source} onValueChange={(v) => setSource(v === "__all__" ? "" : v)}>
              <SelectTrigger className="w-full h-9 rounded-md border border-input bg-input-background">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">전체</SelectItem>
                {NEWS_SOURCE_OPTIONS.filter((o) => o.value !== "").map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">시장</Label>
            <Select value={market === "" ? "__all__" : market} onValueChange={(v) => setMarket(v === "__all__" ? "" : v)}>
              <SelectTrigger className="w-full h-9 rounded-md border border-input bg-input-background">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">전체</SelectItem>
                {NEWS_MARKET_OPTIONS.filter((o) => o.value !== "").map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
        {!loading && (rows.length > 0 || totalElements > 0) && (
          <p className="text-sm text-muted-foreground mb-3">
            총 <strong className="text-foreground">{totalElements.toLocaleString("ko-KR")}</strong>건
            {totalPages > 0 && (
              <span className="ml-2">
                ({(page + 1).toLocaleString("ko-KR")} / {totalPages.toLocaleString("ko-KR")} 페이지)
              </span>
            )}
          </p>
        )}
        <DataTable
          headers={["시간", "시장", "원천", "종목", "구분", "제목", "감정"]}
          rows={rows.map((n) => [
            formatNewsDateTime(n.createdAt as string | number[] | undefined),
            String(n.market ?? "-"),
            String(n.source ?? "-"),
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
            (() => {
              const score = n.sentimentScore;
              if (score == null) return <span className="text-muted-foreground">미분석</span>;
              const num = Number(score);
              if (Number.isNaN(num)) return "-";
              const label = num < 0 ? "부정" : num > 0 ? "긍정" : "중립";
              return (
                <span title={`${num.toFixed(2)}`}>
                  {label} ({num > 0 ? "+" : ""}{num.toFixed(1)})
                </span>
              );
            })()
          ])}
        />
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
            <Button variant="secondary" disabled={page <= 0 || loading} onClick={goToPrevPage}>
              이전
            </Button>
            <span className="text-sm text-muted-foreground">
              {page + 1} / {totalPages} 페이지
            </span>
            <Button variant="secondary" disabled={page >= totalPages - 1 || loading} onClick={goToNextPage}>
              다음
            </Button>
          </div>
        )}
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
  const priceRequestInFlight = useRef(false);

  const handleLoadCurrentPrice = async () => {
    if (!symbol.trim()) return;
    if (priceRequestInFlight.current) return;
    priceRequestInFlight.current = true;
    setError(null);
    setLoadingPrice(true);
    setCurrentPriceData(null);
    try {
      const data = await getCurrentPrice(symbol.trim());
      setCurrentPriceData(data ?? null);
    } catch (e: unknown) {
      const message =
        e instanceof ApiError && e.status === 404
          ? "현재가를 불러올 수 없습니다. (종목 코드 확인 또는 시장 데이터 API 설정 필요)"
          : e instanceof Error
            ? e.message
            : "현재가 조회에 실패했습니다.";
      setError(message);
      setCurrentPriceData(null);
    } finally {
      setLoadingPrice(false);
      priceRequestInFlight.current = false;
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
  const [positions, setPositions] = useState<Array<AccountPositionDto & { market: string }>>([]);
  const [taxSummary, setTaxSummary] = useState<TaxReportSummaryDto | null>(null);

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
        const [sector, risk, rebal, corr, posKr, posUs, tax] = await Promise.all([
          getSectorAnalysis({ accountNo: accNo }).catch(() => null),
          getPortfolioRiskMetrics(accNo).catch(() => null),
          getRebalanceSuggestions(accNo, "US").catch(() => null),
          getCorrelationAnalysis({ accountNo: accNo }).catch(() => null),
          getPositions(accNo, "KR").catch(() => []),
          getPositions(accNo, "US").catch(() => []),
          getTaxSummary(new Date().getFullYear()).catch(() => null)
        ]);
        if (cancelled) return;
        setSectorData(sector ?? null);
        setRiskMetrics(risk ?? null);
        setRebalanceSuggestions(rebal ?? null);
        setCorrelationData(corr ?? null);
        setPositions([
          ...(posKr ?? []).map((p) => ({ ...p, market: "KR" as const })),
          ...(posUs ?? []).map((p) => ({ ...p, market: "US" as const }))
        ]);
        setTaxSummary(tax ?? null);
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

      <Card title="보유 종목">
        <DataTable
          headers={["종목", "시장", "수량", "평균가", "현재가", "평가금액", "평가손익"]}
          rows={positions.map((p) => [
            p.symbol ?? "-",
            <span key={p.symbol} className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-[#f2f4f6] text-[#4e5968]">{p.market}</span>,
            String(p.quantity ?? "-"),
            String(p.averagePrice ?? "-"),
            String(p.currentPrice ?? "-"),
            String(p.totalValue ?? "-"),
            <span key={`pl-${p.symbol}`} className={Number(p.profitLoss) >= 0 ? "text-[#3182f6]" : "text-[#f04452]"}>{String(p.profitLoss ?? "-")}</span>
          ])}
          getRowKey={(_, i) => `pos-${positions[i]?.symbol ?? ""}-${positions[i]?.market ?? ""}-${i}`}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="자산 배분 현황" className="md:col-span-1">
          <div className="h-48 bg-[#f2f4f6] border border-dashed border-[#e5e8eb] flex items-center justify-center text-[10px] text-[#8b95a1]">
            [ ASSET ALLOCATION CHART ]
          </div>
        </Card>
        <Card
          title={portfolio ? `트레이딩 포트폴리오 (${getPortfolioDisplayDate(portfolio) || "해당 날짜"})` : "트레이딩 포트폴리오"}
          className="md:col-span-2"
          action={
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-[#f2f4f6] bg-[#f9fafb] px-3 py-2 text-sm text-[#191f28]"
              />
            </div>
          }
        >
          <DataTable
            headers={["종목", "시장", "진입가", "손절가", "목표가", "사유"]}
            rows={(portfolio?.items ?? []).map((it: TradingPortfolioItemDto) => [
              String(it.symbol ?? "-"),
              String(it.market ?? "-"),
              String(it.entryPrice ?? "-"),
              <span key="sl" className="text-[#f04452] font-medium">{String(it.stopLossPrice ?? "-")}</span>,
              <span key="tg" className="text-[#00D47E] font-medium">{String(it.targetPrice ?? "-")}</span>,
              String(it.reason ?? "-")
            ])}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="수수료 영향">
          <div className="space-y-2 text-[14px] text-[#4e5968]">
            <p><span className="font-semibold text-[#191f28]">매매 수수료</span> · 증권사별 적용</p>
            <p><span className="font-semibold text-[#191f28]">증권거래세</span> · 매도 시 과세 대상</p>
            <p className="text-[12px] text-[#8b95a1] mt-2">* 실제 수수료는 증권사/거래 조건에 따라 달라집니다.</p>
          </div>
        </Card>
        <Card title="세금 영향">
          <div className="space-y-2 text-[14px] text-[#4e5968]">
            {taxSummary && (
              <>
                {taxSummary.domesticRealizedGainLoss != null && <p><span className="font-semibold text-[#191f28]">국내 실현손익 (YTD)</span> {Number(taxSummary.domesticRealizedGainLoss).toLocaleString()}원</p>}
                {taxSummary.overseasRealizedGainLoss != null && <p><span className="font-semibold text-[#191f28]">해외 실현손익 (YTD)</span> {Number(taxSummary.overseasRealizedGainLoss).toLocaleString()}원</p>}
                {taxSummary.estimatedTax != null && <p><span className="font-semibold text-[#191f28]">예상 양도세</span> {Number(taxSummary.estimatedTax).toLocaleString()}원</p>}
                {taxSummary.disclaimer && <p className="text-[12px] text-[#8b95a1] mt-2">* {taxSummary.disclaimer}</p>}
              </>
            )}
            {!taxSummary && <p className="text-[#8b95a1]">연말 세금 요약 데이터가 없습니다.</p>}
          </div>
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

/** 종목 코드로 시장 추론: 6자리 숫자면 KR, 아니면 US (수동 주문 시 시장 자동 선택용). */
function inferMarketFromSymbol(symbol: string): "KR" | "US" {
  const s = (symbol ?? "").trim();
  if (s.length === 6 && /^\d+$/.test(s)) return "KR";
  return "US";
}

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
  const [marketFilter, setMarketFilter] = useState<string>("");
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
      searchSymbols({
        q: query.trim() || undefined,
        market: marketFilter === "KR" || marketFilter === "US" ? marketFilter : undefined,
      })
        .then((list) => setResults(list ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, query.trim() ? 300 : 0);
    return () => clearTimeout(t);
  }, [open, query, marketFilter]);

  const handleSelect = (item: SymbolSearchItemDto) => {
    const symbol = item.symbol ?? "";
    const name = item.name ?? symbol;
    const market = (item.market && (item.market === "KR" || item.market === "US")) ? item.market : inferMarketFromSymbol(symbol);
    onSelect(symbol, name, market);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>종목 검색</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 p-2 text-sm rounded"
            placeholder="종목명 또는 종목코드 검색 (국내·미국)"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            autoFocus
          />
          <select
            className="border border-gray-300 p-2 text-sm rounded bg-white min-w-[80px]"
            value={marketFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMarketFilter(e.target.value)}
            aria-label="시장 필터"
          >
            <option value="">전체</option>
            <option value="KR">국내(KR)</option>
            <option value="US">미국(US)</option>
          </select>
        </div>
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
  /** 한투 API 주문체결조회 (최근 7일) */
  const [brokerOrderHistory, setBrokerOrderHistory] = useState<OrderHistoryItemDto[]>([]);
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
  const [priceLoading, setPriceLoading] = useState(false);
  const orderPriceFetchInFlight = useRef(false);
  const lastOrderPriceFetchedKey = useRef<string | null>(null);

  /** 주문 목록 최신순 정렬 (API에서도 내림차순 반환) */
  const sortedOrderItems = React.useMemo(
    () => [...items].sort((a, b) => new Date(b.orderTime ?? 0).getTime() - new Date(a.orderTime ?? 0).getTime()),
    [items]
  );

  /** 종목·시장 선택 시 KR이면 현재가 1회만 조회하여 가격 필드에 반영 */
  const fetchCurrentPriceForOrder = useCallback(async (symbol: string, market: string) => {
    if (!symbol.trim() || market !== "KR") return;
    if (orderPriceFetchInFlight.current) return;
    const key = `${symbol.trim()}|${market}`;
    if (lastOrderPriceFetchedKey.current === key) return;
    orderPriceFetchInFlight.current = true;
    lastOrderPriceFetchedKey.current = key;
    setPriceLoading(true);
    try {
      const dto = await getCurrentPrice(symbol.trim());
      if (dto?.currentPrice != null && Number(dto.currentPrice) > 0) {
        setOrderPrice(String(Math.round(Number(dto.currentPrice))));
      }
    } catch (err) {
      // 404 등 실패 시에도 같은 종목 재요청 방지 (무한루프 방지). 키 유지.
      console.error("[수동주문] 가격 자동 조회 실패:", err);
    } finally {
      setPriceLoading(false);
      orderPriceFetchInFlight.current = false;
    }
  }, []);

  /** 수량 입력 후 가격이 비어 있으면 KR 현재가 1회만 자동 조회 (useEffect 의존 최소화로 연속 호출 방지) */
  useEffect(() => {
    const q = orderQuantity.trim();
    if (
      orderSymbol.trim() &&
      orderMarket === "KR" &&
      orderPrice.trim() === "" &&
      q !== "" &&
      Number(q) > 0 &&
      !priceLoading &&
      !orderPriceFetchInFlight.current
    ) {
      const key = `${orderSymbol.trim()}|${orderMarket}`;
      if (lastOrderPriceFetchedKey.current === key) return;
      fetchCurrentPriceForOrder(orderSymbol.trim(), orderMarket);
    }
  }, [orderSymbol, orderQuantity, orderMarket, orderPrice, priceLoading, fetchCurrentPriceForOrder]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
      setAccountNo(main?.accountNo ?? null);
      if (main?.accountNo) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const startStr = startDate.toISOString().slice(0, 10);
        const endStr = endDate.toISOString().slice(0, 10);
        const [list, brokerHistory] = await Promise.all([
          getOrders(main.accountNo),
          getOrderHistory(main.accountNo, startStr, endStr).catch(() => [])
        ]);
        setItems(list);
        setBrokerOrderHistory(brokerHistory ?? []);
      } else {
        setItems([]);
        setBrokerOrderHistory([]);
      }
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
      setOrderError("계좌·종목·수량을 입력하세요. (국내 종목은 가격 자동 조회, 미국 종목은 가격 수동 입력)");
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
            <Input
              label="수량"
              type="number"
              value={orderQuantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setOrderQuantity(value);
                // 수량 입력 직후 가격이 비어 있으면 비동기로 현재가 즉시 조회
                if (
                  orderSymbol.trim() &&
                  orderMarket === "KR" &&
                  orderPrice.trim() === "" &&
                  value.trim() !== "" &&
                  Number(value.trim()) > 0 &&
                  !priceLoading
                ) {
                  fetchCurrentPriceForOrder(orderSymbol.trim(), orderMarket);
                }
              }}
              placeholder="1"
            />
            <Input
              label="가격"
              type="number"
              value={orderPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderPrice(e.target.value)}
              placeholder={orderMarket === "US" ? "미국 종목: 가격 수동 입력" : priceLoading ? "조회 중…" : "종목·수량 입력 시 자동"}
              disabled={priceLoading}
            />
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
              setOrderPrice("");
              fetchCurrentPriceForOrder(symbol, market);
            }}
          />
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="secondary" className="text-xs">전체</Button>
          <Button variant="ghost" className="text-xs">체결</Button>
          <Button variant="ghost" className="text-xs">미체결</Button>
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
          headers={["주문시간", "종목", "구분", "가격", "수량", "상태", "사유"]}
          rows={sortedOrderItems.map((o) => [
            formatOrderTime(o.orderTime),
            String(o.symbolName ?? o.symbol ?? "-"),
            String(o.orderType ?? "-"),
            formatOrderPrice(o.price, o.totalAmount, o.market),
            String(o.quantity ?? "-"),
            String(o.status ?? "-"),
            o.status === "FAILED" && o.message
              ? `실패: ${o.message}`
              : String(o.explanation ?? "-")
          ])}
          getRowKey={(_, i) => `order-${sortedOrderItems[i]?.orderId ?? i}`}
        />
      </Card>

      {accountNo && (
        <Card title="한투 API 체결 내역 (최근 7일)">
          <p className="text-sm text-muted-foreground mb-3">
            증권사에 실제로 전달된 주문·체결만 표시됩니다. 위 표는 본 시스템에서 시도한 모든 주문(실패·취소 포함)입니다.
          </p>
          <DataTable
            headers={["주문시간", "종목", "구분", "가격", "수량", "상태"]}
            rows={brokerOrderHistory.map((o) => {
              const qty = (o as { orderQuantity?: number }).orderQuantity ?? o.quantity ?? 0;
              const priceStr = (o as { orderPrice?: string }).orderPrice ?? o.price;
              const total = priceStr != null && qty ? Number(priceStr) * qty : null;
              return [
                formatOrderTime(o.orderTime),
                String(o.symbol ?? "-"),
                String(o.orderType ?? "-"),
                formatOrderPrice(priceStr, total, "KR"),
                String(qty),
                String((o as { orderStatus?: string }).orderStatus ?? o.status ?? "-")
              ];
            })}
            getRowKey={(_, i) => `broker-${i}`}
          />
        </Card>
      )}
    </div>
  );
};
