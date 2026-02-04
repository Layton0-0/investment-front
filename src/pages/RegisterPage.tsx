import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input } from "../../components/UI";
import { signup, verifyAccount } from "../api/authApi";
import { ApiError } from "../api/http";

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
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("계좌인증에 실패했습니다.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSignup = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await signup({
        username,
        password,
        brokerType,
        appKey,
        appSecret,
        serverType,
        accountNo,
        preIssuedAccessToken
      });
      setInfo("회원가입이 완료되었습니다. 로그인해 주세요.");
      navigate("/login");
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-sm" title="INVESTMENT CHOI - SIGNUP">
        <div className="space-y-4 py-4">
          <Input
            label="Username"
            placeholder="user_01"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
          <Input
            label="Broker Type"
            placeholder="KOREA_INVESTMENT"
            value={brokerType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setBrokerType(e.target.value)
            }
          />
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAccountNo(e.target.value)
            }
          />

          <div className="flex gap-2">
            <Button
              className="w-full"
              variant="secondary"
              disabled={verifying || loading}
              onClick={handleVerify}
            >
              계좌 인증
            </Button>
            <Button className="w-full" disabled={loading} onClick={handleSignup}>
              Create Account
            </Button>
          </div>

          {info && (
            <div className="text-[12px] font-semibold text-[#3182f6] bg-[#e8f3ff] p-3 rounded-xl">
              {info}
            </div>
          )}
          {error && (
            <div className="text-[12px] font-semibold text-[#f04452] bg-[#fff0f0] p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="text-center text-[10px] text-gray-400 uppercase pt-4 border-t border-gray-100">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="underline cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

