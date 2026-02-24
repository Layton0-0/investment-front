import { AutoInvest } from "@/components/Investment";

export default function AutoInvestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">자동투자 현황</h1>
        <p className="text-sm text-muted-foreground">
          4단계 파이프라인(유니버스 → 시그널 → 자금관리 → 매매실행) 현황
        </p>
      </div>
      <AutoInvest />
    </div>
  );
}
