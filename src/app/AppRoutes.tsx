import React, { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { setUnauthorizedHandler } from "@/api/http";
import { Dashboard } from "@/components/Dashboard";
import { AutoInvest, Strategy } from "@/components/Investment";
import { News, Orders, Portfolio } from "@/components/Market";
import { Backtest, Settings } from "@/components/System";
import { Batch } from "@/components/Ops";

import { AppShell } from "./AppShell";
import { RequireAuth } from "./RequireAuth";

import { IndexPage } from "@/pages/IndexPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { MyPage } from "@/pages/MyPage";
import { OpsPage } from "@/pages/OpsPage";
import { useAuth } from "./AuthContext";

function DashboardRoute() {
  const auth = useAuth();
  const navigate = useNavigate();
  return (
    <Dashboard
      serverType={auth.serverType}
      hasAccount={true}
      onNavigate={(path: string) => navigate(path)}
    />
  );
}

export function AppRoutes() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      auth.logout();
      navigate("/login", { replace: true });
    });
    return () => setUnauthorizedHandler(undefined);
  }, [auth, navigate]);

  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/register" element={<Navigate to="/signup" replace />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/auto-invest" element={<AutoInvest />} />
          <Route path="/strategies/kr" element={<Strategy market="kr" />} />
          <Route path="/strategies/us" element={<Strategy market="us" />} />
          <Route path="/news" element={<News />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/batch" element={<Batch role={auth.role} />} />
          <Route path="/backtest" element={<Backtest />} />
          <Route path="/settings" element={<Settings serverType={auth.serverType} />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/risk" element={<OpsPage />} />
          <Route path="/ops/:subPage" element={<OpsPage />} />
          <Route path="*" element={<div />} />
        </Route>
      </Route>
    </Routes>
  );
}

