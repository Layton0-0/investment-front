import React, { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { setUnauthorizedHandler } from "@/api/http";
import AutoInvestPage from "@/pages/app/AutoInvestPage";
import StrategyPage from "@/pages/app/StrategyPage";
import NewsPage from "@/pages/app/NewsPage";
import PortfolioPage from "@/pages/app/PortfolioPage";
import OrdersPage from "@/pages/app/OrdersPage";
import BacktestPage from "@/pages/app/BacktestPage";
import SettingsPage from "@/pages/app/SettingsPage";

import { AppLayout } from "@/components/layout";
import { RequireAuth } from "./RequireAuth";

import { IndexPage } from "@/pages/IndexPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { MyPage } from "@/pages/MyPage";
import { OpsPage } from "@/pages/OpsPage";
import TaxReportPage from "@/pages/app/TaxReportPage";
import DashboardPage from "@/pages/app/DashboardPage";
import { useAuth } from "./AuthContext";

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
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/auto-invest" element={<AutoInvestPage />} />
          <Route path="/strategies/:market" element={<StrategyPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/batch" element={<Navigate to="/ops/data" replace />} />
          <Route path="/backtest" element={<BacktestPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/report/tax" element={<TaxReportPage />} />
          <Route path="/risk" element={<OpsPage />} />
          <Route path="/ops/data" element={<OpsPage />} />
          <Route path="/ops/alerts" element={<OpsPage />} />
          <Route path="/ops/model" element={<OpsPage />} />
          <Route path="/ops/audit" element={<OpsPage />} />
          <Route path="/ops/health" element={<OpsPage />} />
          <Route path="/ops/governance" element={<OpsPage />} />
          <Route path="*" element={<div />} />
        </Route>
      </Route>
    </Routes>
  );
}

