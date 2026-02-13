import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getDailyChart, type DailyChartPointDto } from "@/api/marketDataApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface PriceChartProps {
  symbol: string;
  market: string;
  title?: string;
  from?: string;
  to?: string;
  height?: number;
}

/**
 * 종목 일봉 가격 추이 차트. TB_DAILY_STOCK 기반 API 사용.
 */
export function PriceChart({
  symbol,
  market,
  title,
  from,
  to,
  height = 280,
}: PriceChartProps) {
  const [data, setData] = useState<DailyChartPointDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDailyChart(symbol, market, from, to)
      .then((res) => {
        if (!cancelled) {
          setData(Array.isArray(res) ? res : []);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message ?? "차트 로드 실패");
          setData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [symbol, market, from, to]);

  const chartData = data.map((d) => ({
    date: d.date ?? "",
    close: d.close != null ? Number(d.close) : 0,
    open: d.open != null ? Number(d.open) : 0,
    high: d.high != null ? Number(d.high) : 0,
    low: d.low != null ? Number(d.low) : 0,
    volume: d.volume ?? 0,
  }));

  const displayTitle = title ?? `${symbol} (${market})`;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center text-muted-foreground text-sm"
            style={{ height }}
          >
            로딩 중…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center text-muted-foreground text-sm"
            style={{ height }}
          >
            {error ?? "표시할 일봉 데이터가 없습니다."}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{displayTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => (v ? v.slice(0, 7) : "")}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
            />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString("ko-KR"), "종가"]}
              labelFormatter={(label) => label}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="hsl(var(--primary))"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
