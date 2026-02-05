import React, { useEffect, useState } from "react";
import { Card, Guardrail } from "@/components/UI";
import { getMyPage } from "@/api/authApi";
import { ApiError } from "@/api/http";
import { useAuth } from "@/app/AuthContext";

export function MyPage() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card title="마이페이지">
        <div className="space-y-2 text-[15px] text-[#333d4b]">
          <div className="flex justify-between">
            <span className="text-[#8b95a1] font-semibold">Role</span>
            <span className="font-bold">{auth.role}</span>
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
    </div>
  );
}

