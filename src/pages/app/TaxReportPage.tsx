import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, AlertTriangle } from "lucide-react";
import { getTaxSummary, downloadTaxSummaryExport, type TaxReportSummaryDto } from "@/api/reportApi";

const DEFAULT_DISCLAIMER =
  "본 자료는 가정·한계가 있으며 세무 자문이 아닙니다. 신고 시 전문가 확인을 권장합니다.";

function formatAmount(value: number | null | undefined): string {
  if (value == null) return "데이터 없음";
  const n = Number(value);
  if (Number.isNaN(n)) return "데이터 없음";
  const formatted = new Intl.NumberFormat("ko-KR").format(Math.round(n));
  return n >= 0 ? `+₩${formatted}` : `-₩${formatted.replace(/^-/, "")}`;
}

function formatAmountNoSign(value: number | null | undefined): string {
  if (value == null) return "데이터 없음";
  const n = Number(value);
  if (Number.isNaN(n)) return "데이터 없음";
  return `₩${new Intl.NumberFormat("ko-KR").format(Math.round(n))}`;
}

function amountClass(value: number | null | undefined): string {
  if (value == null) return "";
  return Number(value) >= 0 ? "text-success" : "text-destructive";
}

const currentYear = new Date().getFullYear();

/** 내보낼 데이터가 없는지: 국내·해외 실현손익·배당 모두 값이 없을 때 true */
function hasNoExportData(data: TaxReportSummaryDto | null): boolean {
  if (data == null) return true;
  const hasDomestic = data.domesticRealizedGainLoss != null;
  const hasOverseas = data.overseasRealizedGainLoss != null;
  const hasDividend = data.dividendTotal != null;
  return !hasDomestic && !hasOverseas && !hasDividend;
}

export default function TaxReportPage() {
  const [year, setYear] = useState(String(currentYear));
  const [data, setData] = useState<TaxReportSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNoDataModal, setShowNoDataModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const yearNum = year ? parseInt(year, 10) : undefined;
    getTaxSummary(Number.isNaN(yearNum) ? undefined : yearNum)
      .then((res) => {
        if (!cancelled) {
          setData(res);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? "요약을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [year]);

  const domestic = data?.domesticRealizedGainLoss;
  const overseas = data?.overseasRealizedGainLoss;
  const total =
    domestic != null && overseas != null
      ? domestic + overseas
      : domestic != null
        ? domestic
        : overseas != null
          ? overseas
          : null;

  const noExportData = hasNoExportData(data);

  const handleExportClick = (format: "csv" | "pdf") => {
    if (noExportData) {
      setShowNoDataModal(true);
      return;
    }
    downloadTaxSummaryExport(Number(year), format);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">연말 세금·리포트</h1>
          <p className="text-sm text-muted-foreground">연간 투자 수익 및 세금 요약</p>
        </div>
        <Select value={year} onValueChange={setYear} disabled={loading}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={String(currentYear)}>{currentYear}년</SelectItem>
            <SelectItem value="2024">2024년</SelectItem>
            <SelectItem value="2023">2023년</SelectItem>
            <SelectItem value="2022">2022년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            요약 조회 중…
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">연간 실현손익 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">총 실현손익</p>
                  <p className={`text-2xl font-bold ${amountClass(total)}`}>
                    {formatAmount(total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">국내 실현손익</p>
                  <p className={`text-xl font-bold ${amountClass(domestic)}`}>
                    {formatAmount(domestic)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">해외 실현손익</p>
                  <p className={`text-xl font-bold ${amountClass(overseas)}`}>
                    {formatAmount(overseas)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">국내/해외 구분 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">구분</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">
                        손익
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 font-medium">국내 주식</td>
                      <td
                        className={`py-3 px-2 text-right font-medium ${amountClass(domestic)}`}
                      >
                        {formatAmount(domestic)}
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-2 font-medium">해외 주식</td>
                      <td
                        className={`py-3 px-2 text-right font-medium ${amountClass(overseas)}`}
                      >
                        {formatAmount(overseas)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">배당 소득 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">총 배당금</p>
              <p className="text-xl font-bold">
                {formatAmountNoSign(data?.dividendTotal)}
              </p>
              {data?.estimatedTax != null && (
                <>
                  <p className="text-sm text-muted-foreground mt-3">예상 세금(추정)</p>
                  <p className="text-xl font-bold">
                    {formatAmountNoSign(data.estimatedTax)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExportClick("csv")}
              title="CSV 다운로드"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV 내보내기
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportClick("pdf")}
              title="PDF 다운로드"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF 내보내기
            </Button>
          </div>

          <AlertDialog open={showNoDataModal} onOpenChange={setShowNoDataModal}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>데이터 없음</AlertDialogTitle>
                <AlertDialogDescription>
                  표시된 데이터가 없어 내보내기를 할 수 없습니다. 해당 연도에 실현손익·배당 데이터가 있으면 다시 시도해 주세요.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowNoDataModal(false)}>확인</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      <Card className="border-muted bg-muted/30">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">면책 안내</p>
            <p>{data?.disclaimer ?? DEFAULT_DISCLAIMER}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
