import { Portfolio } from "@/components/Market";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">포트폴리오</h1>
        <p className="text-sm text-muted-foreground">
          보유 종목·일별 트레이딩 포트폴리오
        </p>
      </div>
      <Portfolio />
    </div>
  );
}
