import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle, Info, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

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
  const [pipelineAutoExecute, setPipelineAutoExecute] = useState<boolean>(false);
  const [pipelineAllowRealExecution, setPipelineAllowRealExecution] = useState<boolean>(false);

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
        setPipelineAutoExecute(existing.pipelineAutoExecute ?? false);
        setPipelineAllowRealExecution(existing.pipelineAllowRealExecution ?? false);
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

  const buildTradingDto = (autoOn: boolean): TradingSettingDto => ({
    maxInvestmentAmount: Number(maxInvestmentAmount) || 10000000,
    minInvestmentAmount: undefined,
    defaultCurrency,
    autoTradingEnabled: autoOn,
    roboAdvisorEnabled: false,
    shortTermRatio: undefined,
    mediumTermRatio: undefined,
    longTermRatio: undefined,
    pipelineAutoExecute: autoOn,
    pipelineAllowRealExecution: pipelineAllowRealExecution,
  });

  const handleSaveTrading = async () => {
    setSaveError(null);
    setInfo(null);
    if (!currentTradingAccountNo) {
      setSaveError("계좌를 먼저 연결해주세요.");
      return;
    }
    try {
      await updateSetting(currentTradingAccountNo, buildTradingDto(effectiveAutoOn));
      setInfo("저장되었습니다.");
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "거래 설정 저장에 실패했습니다.");
    }
  };

  const handleTurnOnAutoTrading = async () => {
    setSaveError(null);
    setInfo(null);
    if (!currentTradingAccountNo) {
      setSaveError("계좌를 먼저 연결해주세요.");
      return;
    }
    setAutoTradingEnabled(true);
    try {
      await updateSetting(currentTradingAccountNo, buildTradingDto(true));
      setInfo("자동투자가 켜졌습니다. 이 계좌(모의/실)에서 자동 매매가 활성화됩니다.");
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "자동투자 활성화에 실패했습니다.");
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

                <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">자동투자 ON/OFF</p>
                      <p className="text-sm text-muted-foreground">시그널 발생 시 이 계좌(모의/실)에서 자동으로 주문합니다. 켜려면 스위치를 ON 한 뒤 저장하거나, 아래 &quot;자동투자 켜기&quot;를 누르세요.</p>
                    </div>
                    <Switch
                      checked={effectiveAutoOn}
                      onCheckedChange={(v) => (onToggleAutoTrade != null ? onToggleAutoTrade() : setAutoTradingEnabled(!!v))}
                      disabled={!currentTradingAccountNo}
                    />
                  </div>
                  {!effectiveAutoOn && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="default" size="sm" disabled={!currentTradingAccountNo || tradingLoading}>
                          자동투자 켜기
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>자동투자 켜기</AlertDialogTitle>
                          <AlertDialogDescription>
                            선택한 계좌({accountCount === 2 ? (tradingTabType === 1 ? "모의계좌" : "실계좌") : mainMock ? "모의계좌" : "실계좌"})에서 자동투자를 켜고 저장합니다. 저장 후 즉시 자동 매매가 활성화됩니다. 진행할까요?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={handleTurnOnAutoTrading}>
                            켜기 및 저장
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm text-muted-foreground">최대 투자금액 (원)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground focus:outline-none">
                          <Info className="w-3.5 h-3.5" aria-label="최대 투자금액 설명" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        이 계좌에서 시스템이 자동 매매에 사용할 수 있는 최대 금액(원)입니다. 이 한도를 넘어서 주문하지 않습니다.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    value={maxInvestmentAmount}
                    onChange={(e) => setMaxInvestmentAmount(e.target.value)}
                    placeholder="10000000"
                  />
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={!currentTradingAccountNo || tradingLoading}>
                      저장
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>자동투자 설정 저장</AlertDialogTitle>
                      <AlertDialogDescription>
                        해당 계좌의 자동투자 ON/OFF와 최대 사용 금액이 저장됩니다. 저장하시겠습니까?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSaveTrading}>
                        저장
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}

          {serverType === 0 && tradingTabType === 0 && (
            <Guardrail message="실계좌 자동 실행을 켜면 해당 계좌에 대해 실제 주문이 나갑니다. 신중히 설정하세요." type="info" />
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
  const pipelineCagr = result?.cagr ?? result?.cagrPct;
  const curveRaw = (mode === "robo" ? roboResult?.equityCurve : result?.equityCurve) ?? [];
  const curveData = curveRaw.map((p: { date: string; value?: number; equity?: number }) => ({
    date: p.date,
    value: Number(p.value ?? p.equity ?? 0),
  })).filter((d) => d.value > 0);
  const hasCurveData = curveData.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">전략 유형:</span>
          <button
            type="button"
            onClick={() => setMode("pipeline")}
            className={`px-3 py-1 rounded text-sm ${mode === "pipeline" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            4단계 파이프라인 (개별종목)
          </button>
          <button
            type="button"
            onClick={() => setMode("robo")}
            className={`px-3 py-1 rounded text-sm ${mode === "robo" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            로보 어드바이저 (ETF)
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          우리 자동매매는 두 가지 전략을 지원합니다. 위에서 선택한 전략에 대해 과거 기간을 시뮬레이션할 수 있습니다.
        </p>
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

      <UICard title="백테스트 설정 및 결과">
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
            {!displayResult && !loading && (
              <p className="text-sm text-muted-foreground">
                테스트 실행을 누르면 선택한 기간·전략으로 시뮬레이션 결과가 여기에 표시됩니다.
              </p>
            )}
            {(mode === "robo" ? roboResult?.warningMessage : result?.warningMessage) && (
              <Guardrail type="warning" message={mode === "robo" ? roboResult!.warningMessage! : result!.warningMessage!} />
            )}
            {displayResult && mode === "pipeline" && (!result?.trades || result.trades.length === 0) && (
              <Guardrail
                type="warning"
                message="이번 기간에는 거래가 한 건도 발생하지 않았습니다. 선택한 기간에 일봉 데이터가 없거나, 전략이 매수/매도 신호를 내지 않았을 수 있습니다. 기간을 넓히거나 일봉 데이터 적재 여부를 확인해 보세요."
              />
            )}
            {displayResult && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-[10px] font-bold text-[#8b95a1] uppercase">CAGR (연평균 수익률)</div>
                    <div className="text-lg font-mono font-bold">{mode === "robo" ? (roboResult?.cagr ?? "-") : (pipelineCagr ?? "-")}{typeof (mode === "robo" ? roboResult?.cagr : pipelineCagr) === "number" ? "%" : ""}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-[10px] font-bold text-[#8b95a1] uppercase">MDD (최대 낙폭)</div>
                    <div className="text-lg font-mono font-bold text-[#4e5968]">{mode === "robo" ? (roboResult?.mddPct ?? "-") : (result?.mddPct ?? "-")}{typeof (mode === "robo" ? roboResult?.mddPct : result?.mddPct) === "number" ? "%" : ""}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-[10px] font-bold text-[#8b95a1] uppercase">Sharpe (위험 대비 수익)</div>
                    <div className="text-lg font-mono font-bold">{mode === "robo" ? (roboResult?.sharpeRatio ?? "-") : (result?.sharpeRatio ?? "-")}</div>
                  </div>
                  {mode === "robo" && (
                    <>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-[10px] font-bold text-[#8b95a1] uppercase">Calmar</div>
                        <div className="text-lg font-mono font-bold">{roboResult?.calmarRatio ?? "-"}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-[10px] font-bold text-[#8b95a1] uppercase">회전율</div>
                        <div className="text-lg font-mono font-bold">{roboResult?.turnover ?? "-"}{typeof roboResult?.turnover === "number" ? "%" : ""}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-[10px] font-bold text-[#8b95a1] uppercase">벤치마크 CAGR</div>
                        <div className="text-lg font-mono font-bold">{roboResult?.benchmarkCagr ?? "-"}{typeof roboResult?.benchmarkCagr === "number" ? "%" : ""}</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="h-64 min-h-[200px] bg-[#f8fafc] border border-[#e5e8eb] rounded flex items-center justify-center overflow-hidden">
                  {hasCurveData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={curveData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e8eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                        <RechartsTooltip formatter={(v: number) => [v.toLocaleString(), "자산"]} labelFormatter={(l) => `날짜: ${l}`} />
                        <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} name="자산" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center px-4">
                      수익 곡선 데이터가 없습니다. 기간을 넓히거나, 로보 모드에서는 US 일봉 수집 후 다시 실행해 보세요.
                    </p>
                  )}
                </div>
              </>
            )}
            {!displayResult && (
              <div className="h-64 min-h-[160px] bg-[#f2f4f6] border border-dashed border-[#e5e8eb] rounded flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center px-4">
                  수익 곡선은 테스트 실행 후 여기에 표시됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </UICard>

      {mode === "pipeline" && (
        <UICard title="시뮬레이션 거래 내역">
          {(result?.trades?.length ?? 0) > 0 ? (
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
          ) : result != null ? (
            <div className="space-y-2 py-4">
              <p className="text-sm font-medium text-foreground">거래 내역이 없습니다.</p>
              <p className="text-sm text-muted-foreground">
                가능한 원인: ① 선택한 기간에 일봉 데이터가 없음 ② 해당 기간에 전략이 매수/매도 신호를 내지 않음.
              </p>
              <p className="text-xs text-muted-foreground">
                기간을 넓히거나, 일봉 데이터 적재 여부를 확인한 뒤 다시 테스트를 실행해 보세요.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              테스트를 실행한 뒤 여기에 거래 내역이 표시됩니다.
            </p>
          )}
        </UICard>
      )}

      <details className="rounded-lg border border-[#e5e8eb] bg-[#f8fafc] group">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-[#f1f5f9] rounded-t-lg [&::-webkit-details-marker]:hidden">
          <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
          지표 설명 (CAGR, MDD, Sharpe 등)
        </summary>
        <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground space-y-3 border-t border-[#e5e8eb]">
          <p><strong className="text-foreground">CAGR (연평균 수익률)</strong>: 기간 동안 매년 평균적으로 얼마나 수익이 났는지 나타냅니다. 10%면 1년에 평균 10% 수익이라는 뜻입니다.</p>
          <p><strong className="text-foreground">MDD (최대 낙폭)</strong>: 그 기간 안에서 고점 대비 가장 크게 떨어진 폭(%)입니다. 낮을수록 변동이 덜 심하다는 의미입니다.</p>
          <p><strong className="text-foreground">Sharpe (샤프 비율)</strong>: 수익률을 변동성(위험)으로 나눈 값입니다. 높을수록 위험 대비 수익이 좋다고 보면 됩니다. 보통 1 이상이면 양호한 편입니다.</p>
          <p><strong className="text-foreground">Calmar</strong>: 연평균 수익률을 최대 낙폭(MDD)으로 나눈 값입니다. 낙폭 대비 수익이 얼마나 나는지 보는 지표입니다.</p>
          <p><strong className="text-foreground">회전율</strong>: 1년 동안 포트폴리오가 얼마나 자주 바뀌었는지(%)를 나타냅니다. 높으면 거래가 잦다는 뜻입니다.</p>
          <p><strong className="text-foreground">벤치마크 CAGR</strong>: 비교 대상(예: 시장 지수)의 연평균 수익률입니다. 우리 전략 CAGR이 벤치마크보다 높으면 상대적으로 잘한 것입니다.</p>
        </div>
      </details>
    </div>
  );
};
