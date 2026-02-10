import React, { useEffect, useState } from "react";
import { Card, Guardrail, Button, Input } from "@/components/UI";
import { getMyPage, updateMyPage } from "@/api/authApi";
import type { MyPageResponseDto, MyPageUpdateRequestDto } from "@/api/authApi";
import { ApiError } from "@/api/http";
import { useAuth } from "@/app/AuthContext";

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
    </div>
  );
}

