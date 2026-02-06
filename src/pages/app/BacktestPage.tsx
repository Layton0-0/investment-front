import { Backtest } from "@/components/System";

export default function BacktestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">백테스트</h1>
        <p className="text-sm text-muted-foreground">
          4단계 파이프라인·로보 어드바이저 백테스트 실행 및 결과
        </p>
      </div>
      <Backtest />
    </div>
  );
}
