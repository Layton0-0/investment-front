import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { Shield, Lock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (smart-portfolio-pal style) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Shield className="w-7 h-7 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">Pulsarve</span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-6">
            AI가 관리하는
            <br />
            스마트 자산관리
          </h1>
          <p className="text-lg text-primary-foreground/70 max-w-md">
            전문가 수준의 투자를 누구나 쉽게. 한국과 미국 시장에 분산 투자하여 안정적인 수익을 창출합니다.
          </p>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-primary-foreground/10 rounded-lg">
              <Lock className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-sm text-primary-foreground/70">256-bit 암호화</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-primary-foreground/10 rounded-lg">
              <Shield className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-sm text-primary-foreground/70">금융보안원 인증</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-20 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2 justify-center">
              <Logo className="w-10 h-10" />
              <span className="text-xl font-bold text-foreground">Pulsarve</span>
            </Link>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">로그인</h2>
            <p className="text-muted-foreground">
              계정에 로그인하여 포트폴리오를 관리하세요
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-userid" className="text-foreground">아이디</Label>
              <Input
                id="login-userid"
                type="text"
                placeholder="아이디 입력"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: undefined }));
                }}
                className="h-12"
                autoComplete="username"
              />
              {fieldErrors.username && (
                <p className="text-sm text-destructive" role="alert">{fieldErrors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-foreground">비밀번호</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className="h-12"
                autoComplete="current-password"
              />
              {fieldErrors.password && (
                <p className="text-sm text-destructive" role="alert">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              type="button"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={loading}
              onClick={() => handleLogin()}
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            아직 계정이 없으신가요?{" "}
            <Link to="/signup" className="text-accent hover:text-accent/80 font-medium">
              회원가입
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
