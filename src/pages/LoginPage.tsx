import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input } from "../../components/UI";
import { login as loginApi } from "../api/authApi";
import { ApiError } from "../api/http";
import { useAuth, type Role } from "../app/AuthContext";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (role: Role) => {
    setError(null);
    setLoading(true);
    try {
      const res = await loginApi({ username: userId, password });
      auth.login({ role, accessToken: res.token, userId: res.userId, username: res.username });
      navigate("/");
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-sm" title="INVESTMENT CHOI - LOGIN">
        <div className="space-y-4 py-4">
          <Input
            label="ID"
            placeholder="admin / user"
            value={userId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUserId(e.target.value)
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
          <Button className="w-full" disabled={loading} onClick={() => handleLogin("User")}>
            USER LOGIN
          </Button>
          <Button
            className="w-full"
            variant="secondary"
            disabled={loading}
            onClick={() => handleLogin("Ops")}
          >
            OPS LOGIN
          </Button>
          {error && (
            <div className="text-[12px] font-semibold text-[#f04452] bg-[#fff0f0] p-3 rounded-xl">
              {error}
            </div>
          )}
          <div className="text-center text-[10px] text-gray-400 uppercase pt-4 border-t border-gray-100">
            Not a member?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="underline cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

