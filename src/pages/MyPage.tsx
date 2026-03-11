import React, { useCallback, useEffect, useState } from "react";
import { Card, Guardrail, Button, Input } from "@/components/UI";
import { getMyPage, getAuthTokens, updateMyPage } from "@/api/authApi";
import type { MyPageResponseDto, MyPageUpdateRequestDto } from "@/api/authApi";
import { ApiError } from "@/api/http";
import { useAuth } from "@/app/AuthContext";

function maskToken(value: string): string {
  if (!value || value.length <= 8) return "••••••••";
  return value.slice(0, 4) + "••••••••" + value.slice(-4);
}

export function MyPage() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MyPageResponseDto | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [tokens, setTokens] = useState<{ accessToken: string; websocketToken: string } | null>(null);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [tokensError, setTokensError] = useState<string | null>(null);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showWebsocketToken, setShowWebsocketToken] = useState(false);

  const fetchTokens = useCallback(async () => {
    if (!auth.userId) return;
    setTokensError(null);
    setTokensLoading(true);
    try {
      const res = await getAuthTokens(String(auth.serverType));
      setTokens({ accessToken: res.accessToken ?? "", websocketToken: res.websocketToken ?? "" });
    } catch (e) {
      setTokensError(e instanceof ApiError ? e.message : "토큰 조회에 실패했습니다.");
      setTokens(null);
    } finally {
      setTokensLoading(false);
    }
  }, [auth.userId, auth.serverType]);

  const copyToClipboard = useCallback((text: string) => {
    if (!text) return;
    void navigator.clipboard.writeText(text);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMyPage();
        if (mounted) setData(res);
      } catch (e) {
        if (!mounted) return;
        if (e instanceof ApiError) setError(e.message);
        else setError("마이페이지 조회에 실패했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);
    if (!newPassword.trim()) {
      setSaveError("새 비밀번호를 입력하세요.");
      return;
    }
    setSaving(true);
    try {
      const payload: MyPageUpdateRequestDto = {
        currentPassword: currentPassword || undefined,
        password: newPassword.trim()
      };
      const res = await updateMyPage(payload);
      setData(res);
      setSaveSuccess("저장되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e: unknown) {
      setSaveError(e instanceof ApiError ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card title="마이페이지">
        <div className="space-y-2 text-[15px] text-[#333d4b]">
          <div className="flex justify-between">
            <span className="text-[#8b95a1] font-semibold">Role</span>
            <span className="font-bold">{data?.role ?? auth.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8b95a1] font-semibold">Server Type</span>
            <span className="font-bold">{auth.serverType === 1 ? "VIRTUAL" : "REAL"}</span>
          </div>
          {loading && (
            <p className="text-[12px] text-[#8b95a1] pt-4">불러오는 중…</p>
          )}
          {error && <Guardrail type="error" message={error} />}
          {data && (
            <div className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8b95a1] font-semibold">UserId</span>
                <span className="font-bold">{data.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b95a1] font-semibold">Username</span>
                <span className="font-bold">{data.username}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="비밀번호 변경">
        <form onSubmit={handleSubmit} className="space-y-4">
          {saveSuccess && <Guardrail type="info" message={saveSuccess} />}
          {saveError && <Guardrail type="error" message={saveError} />}
          <Input
            label="현재 비밀번호"
            type="password"
            value={currentPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="새 비밀번호"
            type="password"
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Button type="submit" disabled={saving}>저장</Button>
        </form>
      </Card>

      <Card title="설정">
        <p className="text-[13px] text-[#8b95a1] mb-4">
          현재 계정의 한국투자증권 API용 Access Token과 WebSocket Token을 조회합니다. (서버 타입: {auth.serverType === 1 ? "모의투자" : "실거래"})
        </p>
        <div className="space-y-4">
          <Button variant="secondary" onClick={fetchTokens} disabled={tokensLoading}>
            {tokensLoading ? "조회 중…" : "토큰 조회"}
          </Button>
          {tokensError && <Guardrail type="error" message={tokensError} />}
          {tokens && (
            <div className="space-y-4 pt-2 border-t border-[#e5e8eb]">
              <div className="space-y-2">
                <span className="text-[13px] font-semibold text-[#4e5968]">Access Token</span>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="flex-1 min-w-0 text-[13px] text-[#333d4b] bg-[#f2f4f6] px-3 py-2 rounded-xl break-all">
                    {showAccessToken ? tokens.accessToken || "(없음)" : maskToken(tokens.accessToken)}
                  </code>
                  <Button variant="ghost" type="button" onClick={() => setShowAccessToken((v) => !v)}>
                    {showAccessToken ? "숨기기" : "표시"}
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => copyToClipboard(tokens.accessToken)}>
                    복사
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[13px] font-semibold text-[#4e5968]">WebSocket Token (Approval Key)</span>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="flex-1 min-w-0 text-[13px] text-[#333d4b] bg-[#f2f4f6] px-3 py-2 rounded-xl break-all">
                    {showWebsocketToken ? tokens.websocketToken || "(없음)" : maskToken(tokens.websocketToken)}
                  </code>
                  <Button variant="ghost" type="button" onClick={() => setShowWebsocketToken((v) => !v)}>
                    {showWebsocketToken ? "숨기기" : "표시"}
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => copyToClipboard(tokens.websocketToken)}>
                    복사
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

