import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AutoInvest } from "@/components/Investment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { quickStart } from "@/api/settingsApi";

export default function AutoInvestPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [agree, setAgree] = useState(false);
  const [maxAmount, setMaxAmount] = useState<string>("1000000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickStart = async () => {
    if (!agree) {
      setError("위험 안내에 동의해 주세요.");
      return;
    }
    const amount = Number(maxAmount?.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("올바른 금액을 입력해 주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await quickStart({ maxInvestmentAmount: amount });
      setOpen(false);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "자동투자 시작에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">자동투자 현황</h1>
          <p className="text-sm text-muted-foreground">
            4단계 파이프라인(유니버스 → 시그널 → 자금관리 → 매매실행) 현황
          </p>
        </div>
        <Button onClick={() => { setOpen(true); setError(null); setAgree(false); setMaxAmount("1000000"); }}>
          자동투자 시작하기
        </Button>
      </div>
      <AutoInvest />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>자동투자 시작</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              자동투자를 시작합니다. 매일 시장을 분석하고 최적의 시점에 투자합니다.
            </p>
            <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-400">위험 안내</p>
              <p className="text-muted-foreground mt-1">
                투자 원금 손실이 발생할 수 있으며, 과거 수익이 미래 수익을 보장하지 않습니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="agree-risk"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="agree-risk" className="cursor-pointer text-sm">
                위험을 인지하고 동의합니다
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-amount">최대 투자 금액 (원)</Label>
              <Input
                id="max-amount"
                type="text"
                inputMode="numeric"
                placeholder="1000000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              취소
            </Button>
            <Button onClick={handleQuickStart} disabled={loading}>
              {loading ? "처리 중..." : "시작하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
