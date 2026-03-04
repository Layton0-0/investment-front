import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { AlertCircle } from "lucide-react";
import { login as loginApi } from "@/api/authApi";
import { useAuth, type Role } from "@/app/AuthContext";
import { validateLogin } from "@/utils/inputValidation";

const LOGIN_ERROR_MESSAGE = "아이디 또는 비밀번호가 올바르지 않습니다.";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setFieldErrors({});
    const validation = validateLogin({ username: userId, password });
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setError(Object.values(validation.errors)[0] ?? null);
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi({ username: userId.trim(), password });
      const role: Role = res.role === "Admin" ? "Admin" : "User";
      auth.login({ role, userId: res.userId, username: res.username });
      navigate("/dashboard");
    } catch {
      setError(LOGIN_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl border border-border p-8">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-16 h-16 mb-4" />
          <h2 className="text-2xl font-black text-foreground">Pulsarve</h2>
          <p className="text-muted-foreground font-medium mt-1">자동 투자의 새로운 기준</p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm" role="alert">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="login-userid" className="text-muted-foreground font-semibold text-sm">아이디</Label>
            <Input
              id="login-userid"
              type="text"
              placeholder="admin / user"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: undefined }));
              }}
              className="h-12 rounded-xl bg-muted border-border focus-visible:ring-primary/20"
              autoComplete="username"
            />
            {fieldErrors.username && <p className="text-[12px] text-destructive" role="alert">{fieldErrors.username}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-muted-foreground font-semibold text-sm">비밀번호</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className="h-12 rounded-xl bg-muted border-border focus-visible:ring-primary/20"
              autoComplete="current-password"
            />
            {fieldErrors.password && <p className="text-[12px] text-destructive" role="alert">{fieldErrors.password}</p>}
          </div>
          <Button
            type="submit"
            className="w-full h-14 rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
        <div className="text-center text-[14px] text-muted-foreground font-semibold pt-6 mt-6 border-t border-border">
          계정이 없으신가요? <Link to="/signup" className="text-primary hover:underline">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
