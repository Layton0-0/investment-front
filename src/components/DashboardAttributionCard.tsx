import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAttribution, type PerformanceAttributionDto } from "@/api/riskApi";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

function mapToPieData(record: Record<string, number> | undefined): { name: string; value: number }[] {
  if (!record || typeof record !== "object") return [];
  return Object.entries(record)
    .filter(([, v]) => Number(v) !== 0)
    .map(([name, value]) => ({ name, value: Number(value) }));
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function DashboardAttributionCard() {
  const [data, setData] = useState<PerformanceAttributionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAttribution()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "귀인 데이터 조회 실패");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">성과 귀인 (팩터/전략별 기여도)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">로딩 중…</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">성과 귀인 (팩터/전략별 기여도)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const totalPnl = data?.totalRealizedPnl ?? 0;
  const bySignal = mapToPieData(data?.bySignalType);
  const byStrategy = mapToPieData(data?.byStrategyType);
  const hasAny = bySignal.length > 0 || byStrategy.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">성과 귀인 (팩터/전략별 기여도)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          청산된 포지션 기준 실현 손익·기여율 (합 100%)
        </p>
        <p className="text-sm font-medium">
          총 실현 손익:{" "}
          <span className={totalPnl >= 0 ? "text-green-600" : "text-red-600"}>
            ₩{totalPnl.toLocaleString("ko-KR")}
          </span>
        </p>
        {!hasAny && (
          <p className="text-sm text-muted-foreground">청산된 포지션이 없으면 기여도가 표시되지 않습니다.</p>
        )}
        {hasAny && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bySignal.length > 0 && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-2">시그널(팩터)별 기여율</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={bySignal}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, value }) => `${name} ${value}%`}
                    >
                      {bySignal.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {byStrategy.length > 0 && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-2">전략별 기여율</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={byStrategy}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, value }) => `${name} ${value}%`}
                    >
                      {byStrategy.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
