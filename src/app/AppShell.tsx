import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Badge, SegmentControl } from "@/components/UI";
import { Logo } from "@/components/Logo";
import { useAuth } from "./AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Globe,
  Newspaper,
  PieChart,
  Zap,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Shield
} from "lucide-react";

type MenuItem = { label: string; path: string; id: string; icon: React.ComponentType<{ className?: string }> };
type MenuGroup = { title: string; items: MenuItem[] };

const baseGroups: MenuGroup[] = [
  {
    title: "Investment",
    items: [
      { label: "대시보드", path: "/dashboard", id: "dashboard", icon: LayoutDashboard },
      { label: "자동투자 현황", path: "/auto-invest", id: "auto", icon: Zap },
      { label: "국내 전략", path: "/strategies/kr", id: "kr", icon: TrendingUp },
      { label: "미국 전략", path: "/strategies/us", id: "us", icon: Globe },
      { label: "뉴스·이벤트", path: "/news", id: "news", icon: Newspaper },
      { label: "포트폴리오", path: "/portfolio", id: "portfolio", icon: PieChart },
      { label: "주문·체결", path: "/orders", id: "orders", icon: Zap }
    ]
  },
  {
    title: "System",
    items: [
      { label: "백테스트", path: "/backtest", id: "backtest", icon: BarChart3 },
      { label: "설정", path: "/settings", id: "settings", icon: Settings }
    ]
  }
];

const opsGroup: MenuGroup = {
  title: "Operations (Admin)",
  items: [
    { label: "데이터 파이프라인", path: "/ops/data", id: "o-data", icon: BarChart3 },
    { label: "알림센터", path: "/ops/alerts", id: "o-alerts", icon: Bell },
    { label: "리스크 리포트", path: "/risk", id: "o-risk", icon: Shield },
    { label: "모델/예측", path: "/ops/model", id: "o-model", icon: TrendingUp },
    { label: "감사 로그", path: "/ops/audit", id: "o-audit", icon: Settings },
    { label: "시스템 헬스", path: "/ops/health", id: "o-health", icon: Shield },
    { label: "전략 거버넌스", path: "/ops/governance", id: "o-governance", icon: Shield }
  ]
};

export function AppShell() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const groups = auth.role === "Admin" ? [...baseGroups, opsGroup] : baseGroups;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const st = params.get("serverType");
    if (st === "0" || st === "1") {
      const v = Number(st) as 0 | 1;
      if (v !== auth.serverType) auth.setServerType(v);
    }
  }, [location.search, auth.serverType, auth.setServerType]);

  const hideSegmentControl =
    location.pathname === "/dashboard" ||
    location.pathname === "/risk" ||
    location.pathname.startsWith("/ops/");

  const linkTo = (path: string) => ({ pathname: path, search: `?serverType=${auth.serverType}` });

  return (
    <div className="flex min-h-screen bg-background text-foreground" style={{ scrollbarGutter: "stable" }}>
      {/* Left Sidebar - smart-portfolio-pal style */}
      <aside className="w-64 min-h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-shrink-0 hidden lg:flex">
        <div className="p-6 border-b border-sidebar-border">
          <button
            type="button"
            onClick={() => navigate(linkTo("/dashboard"))}
            className="flex items-center gap-2 w-full text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">Investment Choi</span>
          </button>
          <div className="mt-3">
            <Badge status={auth.role === "Admin" ? "executed" : "neutral"}>{auth.role}</Badge>
          </div>
        </div>

        {!hideSegmentControl && (
          <div className="p-4 border-b border-sidebar-border">
            <SegmentControl
              options={[
                { label: "모의계좌 (VIRTUAL)", value: 1 },
                { label: "실계좌 (REAL)", value: 0 }
              ]}
              activeValue={auth.serverType}
              onChange={(value) => {
                auth.setServerType(value);
                navigate({ pathname: location.pathname, search: `?serverType=${value}` }, { replace: true });
              }}
            />
          </div>
        )}

        <nav className="flex-1 p-4 overflow-auto">
          {groups.map((group) => (
            <div key={group.title} className="mb-6">
              <h3 className="text-xs font-bold text-sidebar-foreground/60 px-4 mb-2 uppercase tracking-wider">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((m) => {
                  const isActive =
                    location.pathname === m.path ||
                    (m.path !== "/dashboard" && location.pathname.startsWith(m.path));
                  return (
                    <li key={m.path}>
                      <NavLink
                        to={linkTo(m.path)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <m.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{m.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-1">
          <NavLink
            to={linkTo("/mypage")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">마이페이지</span>
          </NavLink>
          <button
            type="button"
            onClick={() => {
              auth.logout();
              navigate("/login");
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">로그아웃</span>
          </button>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-sidebar-foreground">
                {auth.username?.charAt(0) ?? "U"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {auth.username ?? "User"}
              </p>
              <p className="text-xs text-sidebar-foreground/60">{auth.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
              <p className="text-sm text-muted-foreground">포트폴리오 현황을 한눈에 확인하세요</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="알림"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
                <Shield className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">보안 연결</span>
              </div>
            </div>
          </div>
        </header>

        {!hideSegmentControl && (
          <div className="bg-muted/30 border-b border-border px-8 py-3">
            <div className="text-sm text-muted-foreground hidden md:block">
              모의/실계좌 전환은 좌측 사이드바에서 선택하세요.
            </div>
          </div>
        )}

        <div className="p-8 flex-1">
          <Outlet />
        </div>

        <footer className="px-8 py-6 border-t border-border text-sm text-muted-foreground text-center">
          © 2026 Investment Choi Auto-Trading Pipeline v4.0.0
        </footer>
      </main>
    </div>
  );
}
