import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAttribution, type PerformanceAttributionDto } from "@/api/riskApi";

const CHART_COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#ec4899"];

export function DashboardAttributionCard() {
  const [data, setData] = useState<PerformanceAttributionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getAttribution()
      .then((dto) => {
        if (mounted) setData(dto);
      })
      .catch((e) => {
        if (mounted) setError(e instanceof Error ? e.message : "귀인 조회 실패");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">성과 귀인</CardTitle>
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
          <CardTitle className="text-base">성과 귀인</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const totalPnl = data?.totalRealizedPnl ?? 0;
  const byFactor = data?.byFactor?.filter((f) => Number(f.contributionPct) > 0) ?? [];
  const byStrategy = data?.byStrategy?.filter((s) => Number(s.contributionPct) > 0) ?? [];
  const hasChart = byFactor.length > 0 || byStrategy.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">성과 귀인</CardTitle>
        <p className="text-xs text-muted-foreground">
          청산 포지션 기준 팩터/전략별 수익 기여도
          {totalPnl !== 0 && (
            <span className="ml-1">
              · 실현 손익 {totalPnl >= 0 ? "" : "-"}
              {Math.abs(totalPnl).toLocaleString("ko-KR")}원
            </span>
          )}
        </p>
      </CardHeader>
      <CardContent>
        {!hasChart && (
          <p className="text-sm text-muted-foreground">청산된 포지션이 없어 기여도를 표시할 수 없습니다.</p>
        )}
        {hasChart && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {byFactor.length > 0 && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-2">팩터별 기여</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={byFactor.map((f) => ({ name: f.factor, value: Number(f.contributionPct) }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                    >
                      {byFactor.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {byStrategy.length > 0 && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-2">전략별 기여</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={byStrategy.map((s) => ({ name: s.strategy, value: Number(s.contributionPct) }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                    >
                      {byStrategy.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
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
