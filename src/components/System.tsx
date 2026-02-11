import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card as UICard, DataTable, Button as UIButton, Input as UIInput, Guardrail } from "./UI";
import { useAuth } from "@/app/AuthContext";
import { useSettingsAccountsAll } from "@/hooks/useSettingsAccountsAll";
import {
  getSettingByAccountNo,
  updateSetting,
  type SettingsAccountsUpdateRequestDto,
  type TradingSettingDto,
} from "@/api/settingsApi";
import {
  getMainAccount,
  getAccounts,
  setMainAccount,
  type AccountListResponseDto,
} from "@/api/userAccountsApi";
import {
  runBacktest,
  runRoboBacktest,
  getLastPreExecution,
  collectUsDaily,
  type BacktestRunResult,
  type BacktestTradeDto,
  type RoboBacktestResult,
  type LastPreExecutionResultDto,
} from "@/api/backtestApi";
import type { ServerType } from "@/types";
import { AlertTriangle, CheckCircle } from "lucide-react";

export interface SettingsProps {
  serverType: ServerType;
  onToggleAutoTrade?: () => void;
  isAutoTradeOn?: boolean;
}

const defaultCurrency = "KRW";

type AccountFormState = {
  appKey: string;
  appSecret: string;
  accountNo: string;
  currentPassword: string;
};

const emptyAccountForm = (): AccountFormState => ({
  appKey: "",
  appSecret: "",
  accountNo: "",
  currentPassword: "",
});

export const Settings = ({ serverType, onToggleAutoTrade, isAutoTradeOn }: SettingsProps) => {
  const auth = useAuth();
  const { data: accountsData, loading: accountsLoading, error: accountsError, save: saveAccounts, refetch: refetchAccounts } = useSettingsAccountsAll();
  const [info, setInfo] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("accounts");
  const [virtualForm, setVirtualForm] = useState<AccountFormState>(emptyAccountForm);
  const [realForm, setRealForm] = useState<AccountFormState>(emptyAccountForm);
  const [savingVirtual, setSavingVirtual] = useState(false);
  const [savingReal, setSavingReal] = useState(false);

  const [mainMock, setMainMock] = useState<{ accountNo: string } | null>(null);
  const [mainReal, setMainReal] = useState<{ accountNo: string } | null>(null);
  const [accountListVirtual, setAccountListVirtual] = useState<AccountListResponseDto | null>(null);
  const [accountListReal, setAccountListReal] = useState<AccountListResponseDto | null>(null);
  const [settingMainId, setSettingMainId] = useState<string | null>(null);
  const [tradingTabType, setTradingTabType] = useState<1 | 0>(1);
  const [tradingLoading, setTradingLoading] = useState(true);
  const [autoTradingEnabled, setAutoTradingEnabled] = useState(false);
  const [roboAdvisorEnabled, setRoboAdvisorEnabled] = useState(false);
  const [maxInvestmentAmount, setMaxInvestmentAmount] = useState<string>("10000000");
  const [minInvestmentAmount, setMinInvestmentAmount] = useState<string>("100000");
  const [shortTermRatio, setShortTermRatio] = useState<number>(0.2);
  const [mediumTermRatio, setMediumTermRatio] = useState<number>(0.4);
  const [longTermRatio, setLongTermRatio] = useState<number>(0.4);

  const accountCount = (mainMock ? 1 : 0) + (mainReal ? 1 : 0);
  const currentTradingAccountNo = tradingTabType === 1 ? mainMock?.accountNo ?? null : mainReal?.accountNo ?? null;

  const loadMainAccounts = useCallback(async () => {
    try {
      const [mock, real, list1, list0] = await Promise.all([
        getMainAccount("1"),
        getMainAccount("0"),
        getAccounts("1"),
        getAccounts("0"),
      ]);
      setMainMock(mock?.accountNo ? { accountNo: mock.accountNo } : null);
      setMainReal(real?.accountNo ? { accountNo: real.accountNo } : null);
      setAccountListVirtual(list1);
      setAccountListReal(list0);
      if (mock?.accountNo && !real?.accountNo) setTradingTabType(1);
      else if (!mock?.accountNo && real?.accountNo) setTradingTabType(0);
    } catch {
      setMainMock(null);
      setMainReal(null);
      setAccountListVirtual(null);
      setAccountListReal(null);
    }
  }, []);

  useEffect(() => {
    loadMainAccounts();
  }, [loadMainAccounts]);

  const loadTradingSettings = useCallback(async (accountNo: string | null) => {
    if (!accountNo) return;
    setTradingLoading(true);
    try {
      const existing = await getSettingByAccountNo(accountNo);
      if (existing) {
        setAutoTradingEnabled(!!existing.autoTradingEnabled);
        setRoboAdvisorEnabled(!!existing.roboAdvisorEnabled);
        if (existing.maxInvestmentAmount != null) setMaxInvestmentAmount(String(existing.maxInvestmentAmount));
        if (existing.minInvestmentAmount != null) setMinInvestmentAmount(String(existing.minInvestmentAmount));
        if (existing.shortTermRatio != null) setShortTermRatio(Number(existing.shortTermRatio));
        if (existing.mediumTermRatio != null) setMediumTermRatio(Number(existing.mediumTermRatio));
        if (existing.longTermRatio != null) setLongTermRatio(Number(existing.longTermRatio));
      }
    } catch {
      // keep current form state
    } finally {
      setTradingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTradingSettings(currentTradingAccountNo);
  }, [currentTradingAccountNo, loadTradingSettings]);

  const effectiveAutoOn = onToggleAutoTrade !== undefined ? isAutoTradeOn : autoTradingEnabled;
  const setEffectiveAutoOn = onToggleAutoTrade ?? (() => setAutoTradingEnabled((v) => !v));

  const handleSaveVirtual = async () => {
    setSaveError(null);
    setInfo(null);
    setSavingVirtual(true);
    try {
      await saveAccounts({
        currentPassword: virtualForm.currentPassword || undefined,
        virtual: {
          accountNo: virtualForm.accountNo || undefined,
          appKey: virtualForm.appKey || undefined,
          appSecret: virtualForm.appSecret || undefined,
        },
      });
      setInfo("저장되었습니다.");
      setVirtualForm(emptyAccountForm());
      refetchAccounts();
      await loadMainAccounts();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setSavingVirtual(false);
    }
  };

  const handleSaveReal = async () => {
    setSaveError(null);
    setInfo(null);
    setSavingReal(true);
    try {
      await saveAccounts({
        currentPassword: realForm.currentPassword || undefined,
        real: {
          accountNo: realForm.accountNo || undefined,
          appKey: realForm.appKey || undefined,
          appSecret: realForm.appSecret || undefined,
        },
      });
      setInfo("저장되었습니다.");
      setRealForm(emptyAccountForm());
      refetchAccounts();
      await loadMainAccounts();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setSavingReal(false);
    }
  };

  const handleSetMainAccount = async (accountId: string) => {
    setSettingMainId(accountId);
    setSaveError(null);
    setInfo(null);
    try {
      await setMainAccount(accountId);
      setInfo("메인 계좌로 설정되었습니다.");
      await loadMainAccounts();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "메인 계좌 설정에 실패했습니다.");
    } finally {
      setSettingMainId(null);
    }
  };

  const handleSaveTrading = async () => {
    setSaveError(null);
    setInfo(null);
    if (!currentTradingAccountNo) {
      setSaveError("계좌를 먼저 연결해주세요.");
      return;
    }
    try {
      const dto: TradingSettingDto = {
        maxInvestmentAmount: Number(maxInvestmentAmount) || 10000000,
        minInvestmentAmount: Number(minInvestmentAmount) || 100000,
        defaultCurrency,
        autoTradingEnabled: effectiveAutoOn,
        roboAdvisorEnabled,
        shortTermRatio,
        mediumTermRatio,
        longTermRatio,
      };
      await updateSetting(currentTradingAccountNo, dto);
      setInfo("저장되었습니다.");
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "거래 설정 저장에 실패했습니다.");
    }
  };

  const displayError = accountsError ?? saveError;

  const renderAccountCard = (
    title: string,
    block: { appKeyMasked?: string; accountNoMasked?: string; hasAccount?: boolean } | undefined,
    form: AccountFormState,
    setForm: React.Dispatch<React.SetStateAction<AccountFormState>>,
    onSave: () => Promise<void>,
    saving: boolean,
  ) => {
    const connected = block?.hasAccount ?? !!block?.appKeyMasked;
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {connected ? (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              연결됨
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">미등록</span>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">API Key</Label>
              <Input
                type="password"
                placeholder={block?.appKeyMasked || "API Key 입력"}
                value={form.appKey}
                onChange={(e) => setForm((f) => ({ ...f, appKey: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">API Secret</Label>
              <Input
                type="password"
                placeholder="API Secret 입력"
                value={form.appSecret}
                onChange={(e) => setForm((f) => ({ ...f, appSecret: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">계좌번호</Label>
            <Input
              placeholder={block?.accountNoMasked || "계좌번호 입력"}
              value={form.accountNo}
              onChange={(e) => setForm((f) => ({ ...f, accountNo: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Current Password (API Key 변경 시 필요)</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            />
          </div>
          <p className="text-xs text-muted-foreground">※ API Key는 서버에 암호화되어 저장되며, 출금 권한은 허용하지 마십시오.</p>
          <Button onClick={onSave} disabled={saving}>저장</Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {accountsLoading && <Guardrail type="info" message="설정 로딩 중…" />}
      {displayError && <Guardrail type="error" message={displayError} />}
      {info && <Guardrail type="info" message={info} />}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="accounts">계좌·API 연결</TabsTrigger>
          <TabsTrigger value="trading">자동투자 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4 mt-4">
          {renderAccountCard("모의계좌", accountsData?.virtual, virtualForm, setVirtualForm, handleSaveVirtual, savingVirtual)}
          {renderAccountCard("실계좌", accountsData?.real, realForm, setRealForm, handleSaveReal, savingReal)}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">등록된 계좌</CardTitle>
              <p className="text-sm text-muted-foreground">메인 계좌를 변경하면 대시보드·주문 시 해당 계좌가 사용됩니다.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">모의계좌</p>
                {accountListVirtual?.accounts?.length ? (
                  <ul className="space-y-2">
                    {accountListVirtual.accounts.map((a) => (
                      <li key={a.accountId} className="flex items-center justify-between rounded border p-2">
                        <span className="text-sm">{a.accountNoMasked ?? a.accountId} {a.accountName ? `(${a.accountName})` : ""}</span>
                        {a.isDefault ? (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">메인</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={settingMainId !== null}
                            onClick={() => handleSetMainAccount(a.accountId)}
                          >
                            {settingMainId === a.accountId ? "설정 중…" : "메인으로 설정"}
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">등록된 모의계좌가 없습니다.</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">실계좌</p>
                {accountListReal?.accounts?.length ? (
                  <ul className="space-y-2">
                    {accountListReal.accounts.map((a) => (
                      <li key={a.accountId} className="flex items-center justify-between rounded border p-2">
                        <span className="text-sm">{a.accountNoMasked ?? a.accountId} {a.accountName ? `(${a.accountName})` : ""}</span>
                        {a.isDefault ? (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">메인</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={settingMainId !== null}
                            onClick={() => handleSetMainAccount(a.accountId)}
                          >
                            {settingMainId === a.accountId ? "설정 중…" : "메인으로 설정"}
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">등록된 실계좌가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4 mt-4">
          {accountCount === 0 && !tradingLoading && (
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">계좌를 먼저 등록해주세요</p>
                  <p className="text-xs text-muted-foreground">자동투자 설정은 계좌 등록 후 가능합니다.</p>
                </div>
                <Button variant="secondary" onClick={() => setActiveTab("accounts")}>
                  계좌 설정으로 가기
                </Button>
              </CardContent>
            </Card>
          )}

          {accountCount >= 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {accountCount === 2 ? (tradingTabType === 1 ? "모의계좌" : "실계좌") : mainMock ? "모의계좌" : "실계좌"} 자동투자
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {accountCount === 2 && (
                  <div className="flex rounded-lg border border-border p-1 bg-muted/30">
                    <button
                      type="button"
                      onClick={() => setTradingTabType(1)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tradingTabType === 1 ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      모의계좌
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradingTabType(0)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tradingTabType === 0 ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      실계좌
                    </button>
                  </div>
                )}

                {tradingLoading && <Guardrail type="info" message="거래 설정 로딩 중…" />}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">자동 매매</p>
                    <p className="text-sm text-muted-foreground">시그널 발생 시 자동으로 주문</p>
                  </div>
                  <Switch
                    checked={effectiveAutoOn}
                    onCheckedChange={(v) => (onToggleAutoTrade != null ? onToggleAutoTrade() : setAutoTradingEnabled(!!v))}
                    disabled={!currentTradingAccountNo}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">로보어드바이저 (ETF)</p>
                    <p className="text-sm text-muted-foreground">ETF 기반 자동 리밸런싱</p>
                  </div>
                  <Switch
                    checked={roboAdvisorEnabled}
                    onCheckedChange={(v) => {
                      setRoboAdvisorEnabled(!!v);
                      if (v) setAutoTradingEnabled(true);
                    }}
                    disabled={!currentTradingAccountNo}
                  />
                </div>
                {roboAdvisorEnabled && (
                  <p className="text-xs text-muted-foreground bg-accent/10 p-2 rounded">로보어드바이저 활성화 시 자동 매매도 함께 켜집니다.</p>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">최소 투자금액 (원)</Label>
                    <Input
                      type="number"
                      value={minInvestmentAmount}
                      onChange={(e) => setMinInvestmentAmount(e.target.value)}
                      placeholder="100000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">최대 투자금액 (원)</Label>
                    <Input
                      type="number"
                      value={maxInvestmentAmount}
                      onChange={(e) => setMaxInvestmentAmount(e.target.value)}
                      placeholder="10000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">전략 비중 (합계=100%)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">단기</Label>
                      <Input
                        type="number"
                        min={0}
                        max={1}
                        step={0.01}
                        value={shortTermRatio}
                        onChange={(e) => setShortTermRatio(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">중기</Label>
                      <Input
                        type="number"
                        min={0}
                        max={1}
                        step={0.01}
                        value={mediumTermRatio}
                        onChange={(e) => setMediumTermRatio(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">장기</Label>
                      <Input
                        type="number"
                        min={0}
                        max={1}
                        step={0.01}
                        value={longTermRatio}
                        onChange={(e) => setLongTermRatio(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveTrading} disabled={!currentTradingAccountNo || tradingLoading}>
                  저장
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-muted">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">서버 설정 (읽기 전용)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PIPELINE_AUTO_EXECUTE</span>
                <span className="font-mono">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PIPELINE_ALLOW_REAL_EXECUTION</span>
                <span className="font-mono">—</span>
              </div>
              <p className="text-xs text-muted-foreground pt-2">이 설정은 서버에서만 변경 가능합니다.</p>
            </CardContent>
          </Card>

          {serverType === 0 && (
            <Guardrail message="실계좌 자동 실행은 서버 설정(PIPELINE_ALLOW_REAL_EXECUTION)으로만 허용됩니다." type="info" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function getDefaultBacktestEndDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultBacktestStartDate(): string {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - 1, end.getDate());
  return start.toISOString().slice(0, 10);
}

export const Backtest = () => {
  const auth = useAuth();
  const [mode, setMode] = useState<"pipeline" | "robo">("pipeline");
  const [startDate, setStartDate] = useState(getDefaultBacktestStartDate);
  const [endDate, setEndDate] = useState(getDefaultBacktestEndDate);
  const [initialCapital, setInitialCapital] = useState("10000000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestRunResult | null>(null);
  const [roboResult, setRoboResult] = useState<RoboBacktestResult | null>(null);
  const [lastPreExecution, setLastPreExecution] = useState<LastPreExecutionResultDto | null>(null);
  const [collectMessage, setCollectMessage] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "robo") return;
    let mounted = true;
    (async () => {
      try {
        const main = await getMainAccount(auth.serverType === 1 ? "1" : "0");
        if (!mounted || !main?.accountNo) return;
        const last = await getLastPreExecution(main.accountNo);
        if (mounted) setLastPreExecution(last);
      } catch {
        if (mounted) setLastPreExecution(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [mode, auth.serverType]);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "pipeline") {
        const res = await runBacktest({
          startDate,
          endDate,
          market: "KR",
          strategyType: "SHORT_TERM",
          initialCapital: Number(initialCapital) || 10000000
        });
        setResult(res);
        setRoboResult(null);
      } else {
        const res = await runRoboBacktest({
          startDate,
          endDate,
          initialCapital: Number(initialCapital) || 10000000
        });
        setRoboResult(res);
        setResult(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "백테스트 실행에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCollectUsDaily = async () => {
    setCollectMessage(null);
    try {
      const res = await collectUsDaily(
        startDate && endDate ? { startDate, endDate } : undefined
      );
      setCollectMessage(res.message ?? `수집: ${res.collectedDays}일, 저장: ${res.savedTotal}건`);
    } catch (e: unknown) {
      setCollectMessage(e instanceof Error ? e.message : "US 일봉 수집 실패");
    }
  };

  const displayResult = mode === "robo" ? roboResult : result;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium text-muted-foreground">모드:</span>
        <button
          type="button"
          onClick={() => setMode("pipeline")}
          className={`px-3 py-1 rounded text-sm ${mode === "pipeline" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        >
          4단계 파이프라인 백테스트
        </button>
        <button
          type="button"
          onClick={() => setMode("robo")}
          className={`px-3 py-1 rounded text-sm ${mode === "robo" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        >
          로보어드바이저 백테스트
        </button>
      </div>

      {error && <Guardrail type="error" message={error} />}
      {mode === "robo" && lastPreExecution && (
        <UICard title="실행 전 백테스트 최근 결과">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground">통과 여부</span><div className="font-mono">{lastPreExecution.passed ? "통과" : "미통과"}</div></div>
            <div><span className="text-muted-foreground">MDD</span><div className="font-mono">{lastPreExecution.mddPct ?? "-"}%</div></div>
            <div><span className="text-muted-foreground">Sharpe</span><div className="font-mono">{lastPreExecution.sharpeRatio ?? "-"}</div></div>
            <div><span className="text-muted-foreground">실행 시각</span><div className="font-mono">{lastPreExecution.runAt ?? "-"}</div></div>
          </div>
        </UICard>
      )}

      <UICard title={mode === "robo" ? "로보 백테스트 설정" : "백테스트 설정"}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-4 col-span-1">
            {mode === "pipeline" && (
              <div>
                <div className="text-[11px] font-bold text-[#8b95a1] uppercase">전략</div>
                <select className="w-full border border-gray-300 p-2 text-sm bg-white focus:outline-none">
                  <option>SHORT_TERM (KR)</option>
                  <option>MEDIUM_TERM</option>
                  <option>LONG_TERM</option>
                </select>
              </div>
            )}
            <UIInput label="시작일" type="date" value={startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)} />
            <UIInput label="종료일" type="date" value={endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)} />
            <UIInput label="초기자본" type="number" value={initialCapital} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInitialCapital(e.target.value)} placeholder="10000000" />
            {mode === "robo" && (
              <UIButton variant="secondary" className="w-full" onClick={handleCollectUsDaily}>US 일봉 수집</UIButton>
            )}
            {mode === "robo" && collectMessage && <p className="text-xs text-muted-foreground">{collectMessage}</p>}
            <UIButton className="w-full" disabled={loading} onClick={handleRun}>테스트 실행</UIButton>
          </div>
          <div className="col-span-3 border-l border-gray-100 pl-4 space-y-6">
            {(mode === "robo" ? roboResult?.warningMessage : result?.warningMessage) && (
              <Guardrail type="warning" message={mode === "robo" ? roboResult!.warningMessage! : result!.warningMessage!} />
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3">
                <div className="text-[10px] font-bold text-[#8b95a1] uppercase">CAGR</div>
                <div className="text-lg font-mono font-bold">{mode === "robo" ? (roboResult?.cagr ?? "-") : (result?.cagrPct ?? "-")}{mode === "pipeline" ? "%" : ""}</div>
              </div>
              <div className="bg-gray-50 p-3">
                <div className="text-[10px] font-bold text-[#8b95a1] uppercase">MDD</div>
                <div className="text-lg font-mono font-bold text-[#4e5968]">{mode === "robo" ? (roboResult?.mddPct ?? "-") : (result?.mddPct ?? "-")}%</div>
              </div>
              <div className="bg-gray-50 p-3">
                <div className="text-[10px] font-bold text-[#8b95a1] uppercase">Sharpe</div>
                <div className="text-lg font-mono font-bold">{mode === "robo" ? (roboResult?.sharpeRatio ?? "-") : (result?.sharpeRatio ?? "-")}</div>
              </div>
              {mode === "robo" && (
                <>
                  <div className="bg-gray-50 p-3">
                    <div className="text-[10px] font-bold text-[#8b95a1] uppercase">Calmar</div>
                    <div className="text-lg font-mono font-bold">{roboResult?.calmarRatio ?? "-"}</div>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <div className="text-[10px] font-bold text-[#8b95a1] uppercase">회전율</div>
                    <div className="text-lg font-mono font-bold">{roboResult?.turnover ?? "-"}%</div>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <div className="text-[10px] font-bold text-[#8b95a1] uppercase">벤치마크 CAGR</div>
                    <div className="text-lg font-mono font-bold">{roboResult?.benchmarkCagr ?? "-"}</div>
                  </div>
                </>
              )}
            </div>
            <div className="h-64 bg-[#f2f4f6] border border-dashed border-[#e5e8eb] flex items-center justify-center text-[#8b95a1] text-sm">
              [ 수익 곡선 그래프 (Placeholder) ]
            </div>
          </div>
        </div>
      </UICard>

      {mode === "pipeline" && (
        <UICard title="시뮬레이션 거래 내역">
          <DataTable
            headers={["날짜", "종목", "구분", "가격", "수량", "수익률"]}
            rows={(result?.trades ?? []).map((t: BacktestTradeDto) => [
              String(t.tradeDate ?? t.date ?? "-"),
              String(t.symbol ?? "-"),
              String(t.side ?? t.orderType ?? "-"),
              String(t.price ?? "-"),
              String(t.quantity ?? "-"),
              String(t.returnPct ?? "-")
            ])}
          />
        </UICard>
      )}
    </div>
  );
};
