import React from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export interface DashboardKpiCardsProps {
  /** 총 자산 (원). performanceSummary.totalCurrentValue 또는 계좌 합산 */
  totalAssetValue?: number | null;
  /** 총 수익률 (%). 활성 계좌 totalProfitLossRate */
  totalProfitLossRate?: number | null;
  /** 최대 낙폭 (%). performanceSummary.maxMddPct. P4-3 Hero 3지표 */
  maxMddPct?: number | null;
}

const formatCurrency = (value: number) =>
  `₩${value.toLocaleString("ko-KR")}`;

const formatRate = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

export function DashboardKpiCards({
  totalAssetValue,
  totalProfitLossRate,
  maxMddPct
}: DashboardKpiCardsProps) {
  const totalAssetStr =
    totalAssetValue != null ? formatCurrency(totalAssetValue) : "—";
  const rate =
    totalProfitLossRate != null ? Number(totalProfitLossRate) : null;
  const rateStr = rate != null ? formatRate(rate) : "—";
  const ratePositive = rate != null && rate >= 0;
  const mdd =
    maxMddPct != null ? Number(maxMddPct) : null;
  const mddStr = mdd != null ? `${mdd.toFixed(2)}%` : "—";

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0" aria-label="핵심 지표 3개">
      <div className="p-6 bg-card rounded-2xl border border-border shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">총 자산</p>
            <p className="text-2xl font-bold text-foreground">{totalAssetStr}</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-card rounded-2xl border border-border shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">총 수익률</p>
            <p
              className={`text-2xl font-bold ${
                ratePositive ? "text-success" : "text-destructive"
              }`}
            >
              {rateStr}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-card rounded-2xl border border-border shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">MDD</p>
            <p className="text-2xl font-bold text-foreground">{mddStr}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
