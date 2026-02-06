import { useParams, Navigate } from "react-router-dom";
import { Strategy } from "@/components/Investment";

export default function StrategyPage() {
  const { market } = useParams<{ market: string }>();
  const normalizedMarket = market === "us" ? "us" : market === "kr" ? "kr" : null;

  if (normalizedMarket !== "kr" && normalizedMarket !== "us") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {normalizedMarket === "kr" ? "국내 전략" : "미국 전략"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {normalizedMarket === "kr" ? "국내(KOSPI/KOSDAQ)" : "미국(NYSE/NASDAQ)"} 단기/중기/장기 전략 조회·상태 변경
        </p>
      </div>
      <Strategy market={normalizedMarket} />
    </div>
  );
}
