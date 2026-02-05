import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input } from "@/components/UI";
import { Logo } from "@/components/Logo";
import { signup, verifyAccount } from "@/api/authApi";
import { validateSignup } from "@/utils/inputValidation";

const VERIFY_ERROR_MESSAGE = "API 키 또는 계좌번호를 확인해주세요.";
const SIGNUP_ERROR_MESSAGE = "회원가입에 실패했습니다.";

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [brokerType, setBrokerType] = useState("KOREA_INVESTMENT");
  const [appKey, setAppKey] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [serverType, setServerType] = useState<"0" | "1">("1");
  const [accountNo, setAccountNo] = useState(""); // 12345678-12
  const [preIssuedAccessToken, setPreIssuedAccessToken] = useState<string | undefined>(undefined);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setError(null);
    setInfo(null);
    setVerifying(true);
    try {
      const res = await verifyAccount({ brokerType, appKey, appSecret, serverType, accountNo });
      setPreIssuedAccessToken(res.accessToken);
      setInfo(res.message || (res.success ? "계좌인증 성공" : "계좌인증 완료"));
    } catch {
      setError(VERIFY_ERROR_MESSAGE);
    } finally {
      setVerifying(false);
    }
  };

  const handleSignup = async () => {
    setError(null);
    setInfo(null);
    setFieldErrors({});
    const validation = validateSignup({
      username,
      password,
      brokerType,
      appKey,
      appSecret,
      serverType,
      accountNo
    });
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setError(Object.values(validation.errors)[0] ?? null);
      return;
    }
    setLoading(true);
    try {
      await signup({
        username: username.trim(),
        password,
        brokerType,
        appKey: appKey.trim(),
        appSecret: appSecret.trim(),
        serverType,
        accountNo: accountNo.trim(),
        preIssuedAccessToken
      });
      setInfo("회원가입이 완료되었습니다. 로그인해 주세요.");
      navigate("/login");
    } catch {
      setError(SIGNUP_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-none" title="">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-12 h-12 mb-3" />
          <h2 className="text-xl font-bold text-[#191f28]">회원가입</h2>
        </div>
        <div className="space-y-5">
          <Input
            label="사용자명"
            placeholder="user_01"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setUsername(e.target.value);
              if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: undefined }));
            }}
          />
          {fieldErrors.username && (
            <p className="text-[12px] text-[#f04452]" role="alert">{fieldErrors.username}</p>
          )}
          <Input
            label="비밀번호"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
            }}
          />
          {fieldErrors.password && (
            <p className="text-[12px] text-[#f04452]" role="alert">{fieldErrors.password}</p>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-[#4e5968]">브로커 (Broker Type)</label>
            <select
              className="bg-[#f2f4f6] rounded-xl px-4 py-3 text-[15px] text-[#191f28] focus:outline-none focus:ring-2 focus:ring-[#3182f6]/20 appearance-none"
              value={brokerType}
              onChange={(e) => setBrokerType(e.target.value)}
            >
              <option value="KOREA_INVESTMENT">한국투자증권</option>
              <option value="OTHER">기타</option>
            </select>
          </div>
          <Input
            label="Server Type (1: VIRTUAL, 0: REAL)"
            placeholder="1"
            value={serverType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setServerType(e.target.value === "0" ? "0" : "1")
            }
          />
          <Input
            label="App Key"
            placeholder="********"
            value={appKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAppKey(e.target.value)
            }
          />
          <Input
            label="App Secret"
            type="password"
            placeholder="********"
            value={appSecret}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAppSecret(e.target.value)
            }
          />
          <Input
            label="Account No (12345678-12)"
            placeholder="12345678-12"
            value={accountNo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setAccountNo(e.target.value);
              if (fieldErrors.accountNo) setFieldErrors((p) => ({ ...p, accountNo: undefined }));
            }}
          />
          {fieldErrors.accountNo && (
            <p className="text-[12px] text-[#f04452]" role="alert">{fieldErrors.accountNo}</p>
          )}

          <div className="flex gap-2">
            <Button
              className="w-full"
              variant="secondary"
              disabled={verifying || loading}
              onClick={handleVerify}
            >
              계좌 인증
            </Button>
            <Button className="w-full h-14" disabled={loading} onClick={handleSignup}>
              가입하기
            </Button>
          </div>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-[14px] text-[#8b95a1] font-bold hover:text-[#4e5968] cursor-pointer"
          >
            뒤로가기
          </button>

          {info && (
            <div className="text-[12px] font-semibold text-[#3182f6] bg-[#e8f3ff] p-3 rounded-xl">
              {info}
            </div>
          )}
          {error && (
            <div className="text-[12px] font-semibold text-[#f04452] bg-[#fff0f0] p-3 rounded-xl" role="alert">
              {error}
            </div>
          )}

          <div className="text-center text-[14px] text-[#8b95a1] font-semibold pt-6 border-t border-[#f2f4f6]">
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#3182f6] hover:underline cursor-pointer"
            >
              로그인
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

