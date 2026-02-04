import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import { Dashboard } from "../../components/Dashboard";
import { AutoInvest, Strategy } from "../../components/Investment";
import { News, Orders, Portfolio } from "../../components/Market";
import { Backtest, Settings } from "../../components/System";
import { Batch } from "../../components/Ops";

import { AppShell } from "./AppShell";
import { RequireAuth } from "./RequireAuth";

import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { MyPage } from "../pages/MyPage";
import { OpsPage } from "../pages/OpsPage";
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

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardRoute />} />
          <Route path="/auto-invest" element={<AutoInvest />} />
          <Route path="/strategies/kr" element={<Strategy market="kr" />} />
          <Route path="/strategies/us" element={<Strategy market="us" />} />
          <Route path="/news" element={<News />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/batch" element={<Batch role={auth.role} />} />
          <Route path="/backtest" element={<Backtest />} />
          <Route
            path="/settings"
            element={
              <Settings
                serverType={auth.serverType}
                isAutoTradeOn={false}
                onToggleAutoTrade={() => {}}
              />
            }
          />
          <Route path="/mypage" element={<MyPage />} />

          <Route path="/ops/:subPage" element={<OpsPage />} />
          <Route path="*" element={<div />} />
        </Route>
      </Route>
    </Routes>
  );
}

