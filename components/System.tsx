import React, { useEffect, useState } from "react";
import { Card, DataTable, Button, Input, Guardrail } from "./UI";
import { getMainAccount } from "../src/api/userAccountsApi";
import { useAuth } from "../src/app/AuthContext";
import { getSettingsAccounts, updateSettingsAccounts } from "../src/api/settingsApi";
import { runBacktest } from "../src/api/backtestApi";

export const Settings = ({ serverType, onToggleAutoTrade, isAutoTradeOn }: any) => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [appKey, setAppKey] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [masked, setMasked] = useState<{ appKeyMasked?: string; accountNoMasked?: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSettingsAccounts();
        const block = auth.serverType === 1 ? res.virtual : res.real;
        if (!mounted) return;
        setMasked({ appKeyMasked: block?.appKeyMasked, accountNoMasked: block?.accountNoMasked });
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "설정 조회에 실패했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [auth.serverType]);

  const handleSave = async () => {
    setError(null);
    setInfo(null);
    try {
      const serverTypeKey = auth.serverType === 1 ? "virtual" : "real";
      const payload: any = {
        currentPassword: currentPassword || undefined,
        [serverTypeKey]: {
          accountNo: accountNo || undefined,
          appKey: appKey || undefined,
          appSecret: appSecret || undefined
        }
      };
      const res = await updateSettingsAccounts(payload);
      const block = auth.serverType === 1 ? res.virtual : res.real;
      setMasked({ appKeyMasked: block?.appKeyMasked, accountNoMasked: block?.accountNoMasked });
      setInfo("저장되었습니다.");
      setAppKey("");
      setAppSecret("");
      setAccountNo("");
      setCurrentPassword("");
    } catch (e: any) {
      setError(e?.message || "저장에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {loading && <Guardrail type="info" message="설정 로딩 중…" />}
      {error && <Guardrail type="error" message={error} />}
      {info && <Guardrail type="info" message={info} />}
      <Card title="계좌 및 API 연결 설정">
        <div className="space-y-4">
          <Input
            label="Access Key (API Key)"
            placeholder={masked?.appKeyMasked || "************************"}
            value={appKey}
            onChange={(e: any) => setAppKey(e.target.value)}
          />
          <Input
            label="Secret Key"
            placeholder="************************"
            type="password"
            value={appSecret}
            onChange={(e: any) => setAppSecret(e.target.value)}
          />
          <div className="flex gap-4">
            <Input
              label="계좌 번호"
              placeholder={masked?.accountNoMasked || "12345678-12"}
              value={accountNo}
              onChange={(e: any) => setAccountNo(e.target.value)}
            />
            <div className="flex items-end">
              <Button variant="secondary" className="whitespace-nowrap" disabled>
                계좌 인증(회원가입)
              </Button>
            </div>
          </div>
          <Input
            label="Current Password (API Key 변경 시 필요)"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e: any) => setCurrentPassword(e.target.value)}
          />
          <p className="text-[10px] text-gray-400">※ API Key는 서버에 암호화되어 저장되며, 출금 권한은 허용하지 마십시오.</p>
        </div>
      </Card>

      <Card title="자동투자 실행 설정">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold">자동 매매 활성화</div>
              <div className="text-xs text-gray-500">시스템이 시그널에 따라 자동으로 주문을 전송합니다.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAutoTradeOn} 
                onChange={onToggleAutoTrade}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
            </label>
          </div>

          {!isAutoTradeOn && (
            <Guardrail message="주문이 나가지 않습니다. 설정에서 자동 매매를 켜세요." type="warning" />
          )}

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-gray-500 uppercase">자금 배분 비율 (%)</div>
            <div className="flex gap-2 items-center">
              <input type="range" className="flex-1 accent-gray-800" />
              <span className="text-sm font-mono font-bold w-12 text-right">80%</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <Button variant="secondary">취소</Button>
            <Button onClick={handleSave}>설정 저장</Button>
          </div>
        </div>
      </Card>

      {serverType === 0 && (
        <Guardrail message="실계좌 자동 실행은 서버 설정(PIPELINE_ALLOW_REAL_EXECUTION)으로만 허용됩니다." type="info" />
      )}
    </div>
  );
};

export const Backtest = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runBacktest({
        startDate,
        endDate,
        market: "KR",
        strategyType: "SHORT_TERM",
        initialCapital: 10000000
      });
      setResult(res);
    } catch (e: any) {
      setError(e?.message || "백테스트 실행에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Guardrail type="error" message={error} />}
      <Card title="백테스트 설정">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-4 col-span-1">
            <div className="text-[11px] font-bold text-gray-500 uppercase">전략 선택</div>
            <select className="w-full border border-gray-300 p-2 text-sm bg-white focus:outline-none">
              <option>Trend-Follow (US)</option>
              <option>Mean-Revert (KR)</option>
              <option>Robo-ETF-01</option>
            </select>
            <Input label="시작일" type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} />
            <Input label="종료일" type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} />
            <Button className="w-full" disabled={loading} onClick={handleRun}>테스트 실행</Button>
          </div>
          <div className="col-span-3 border-l border-gray-100 pl-4 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase">CAGR</div>
                <div className="text-lg font-mono font-bold">{result?.cagrPct ?? "-"}%</div>
              </div>
              <div className="bg-gray-50 p-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase">MDD</div>
                <div className="text-lg font-mono font-bold text-gray-500">{result?.mddPct ?? "-"}%</div>
              </div>
              <div className="bg-gray-50 p-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Sharpe</div>
                <div className="text-lg font-mono font-bold">{result?.sharpeRatio ?? "-"}</div>
              </div>
            </div>
            <div className="h-64 bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
              [ 수익 곡선 그래프 (Placeholder) ]
            </div>
          </div>
        </div>
      </Card>

      <Card title="시뮬레이션 거래 내역">
        <DataTable 
          headers={['날짜', '종목', '구분', '가격', '수량', '수익률']}
          rows={(result?.trades || []).map((t: any) => [
            String(t.tradeDate || t.date || "-"),
            String(t.symbol || "-"),
            String(t.side || t.orderType || "-"),
            String(t.price || "-"),
            String(t.quantity || "-"),
            String(t.returnPct || "-")
          ])}
        />
      </Card>
    </div>
  );
};
