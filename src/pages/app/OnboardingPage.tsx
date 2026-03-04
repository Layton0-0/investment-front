import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { postOnboardingProfile } from "@/api/onboardingApi";

const STEPS = [
  {
    key: "investmentHorizon",
    title: "투자 기간",
    options: [
      { value: "3M", label: "3개월" },
      { value: "1Y", label: "1년" },
      { value: "3Y_PLUS", label: "3년 이상" }
    ]
  },
  {
    key: "riskTolerance",
    title: "손실 감수 (얼마나 남을 때까지 견디시나요?)",
    options: [
      { value: "N5", label: "약 -5% 남을 때" },
      { value: "N10", label: "약 -10% 남을 때" },
      { value: "N20", label: "약 -20% 남을 때" }
    ]
  },
  {
    key: "investmentAmount",
    title: "투자 예정 금액",
    options: [
      { value: "1M", label: "100만 원" },
      { value: "5M", label: "500만 원" },
      { value: "10M_PLUS", label: "1,000만 원 이상" }
    ]
  }
] as const;

const PROFILE_LABEL: Record<string, string> = {
  CONSERVATIVE: "보수적 (장기 위주)",
  BALANCED: "균형",
  AGGRESSIVE: "공격적"
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    profile: string;
    shortTermRatio: number;
    mediumTermRatio: number;
    longTermRatio: number;
    appliedToSettings?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = STEPS[step];
  const currentValue = answers[currentStep?.key];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentStep.key]: value }));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await postOnboardingProfile({
        investmentHorizon: answers.investmentHorizon ?? "",
        riskTolerance: answers.riskTolerance ?? "",
        investmentAmount: answers.investmentAmount ?? "",
        applyToSettings: true
      });
      setResult({
        profile: res.profile,
        shortTermRatio: res.shortTermRatio,
        mediumTermRatio: res.mediumTermRatio,
        longTermRatio: res.longTermRatio,
        appliedToSettings: res.appliedToSettings
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "퀴즈 제출에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>나의 투자 성향</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-medium">{PROFILE_LABEL[result.profile] ?? result.profile}</p>
            <p className="text-sm text-muted-foreground">
              단기 {Math.round(result.shortTermRatio * 100)}% · 중기 {Math.round(result.mediumTermRatio * 100)}% · 장기 {Math.round(result.longTermRatio * 100)}%
            </p>
            {result.appliedToSettings && (
              <p className="text-sm text-green-600">설정에 반영되었습니다.</p>
            )}
            <Button className="w-full mt-4" onClick={() => navigate("/dashboard")}>
              대시보드로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">초보자 온보딩</h1>
      <p className="text-sm text-muted-foreground">3문항으로 나에게 맞는 전략 비율을 찾아보세요.</p>

      <Card>
        <CardHeader>
          <CardTitle>
            {step + 1}. {currentStep.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {currentStep.options.map((opt) => (
            <Button
              key={opt.value}
              variant={currentValue === opt.value ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            className="w-full mt-4"
            disabled={!currentValue || loading}
            onClick={handleNext}
          >
            {loading ? "처리 중..." : step < STEPS.length - 1 ? "다음" : "결과 보기"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
