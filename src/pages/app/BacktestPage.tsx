import { Backtest } from "@/components/System";

export default function BacktestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">백테스트</h1>
        <p className="text-sm text-muted-foreground">
          내 트레이더가 선택한 전략으로 과거 기간을 시뮬레이션합니다. 전략 유형(4단계 파이프라인 또는 로보 어드바이저)을 선택한 뒤 테스트 실행을 누르면 결과가 표시됩니다.
        </p>
      </div>
      <Backtest />
    </div>
  );
}
