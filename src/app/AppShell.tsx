import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Badge, SegmentControl } from "../../components/UI";
import { useAuth } from "./AuthContext";

type MenuItem = { label: string; path: string; id: string };
type MenuGroup = { title: string; items: MenuItem[] };

const baseGroups: MenuGroup[] = [
  {
    title: "Investment",
    items: [
      { label: "대시보드", path: "/", id: "dashboard" },
      { label: "자동투자 현황", path: "/auto-invest", id: "auto" },
      { label: "국내 전략", path: "/strategies/kr", id: "kr" },
      { label: "미국 전략", path: "/strategies/us", id: "us" },
      { label: "뉴스·이벤트", path: "/news", id: "news" },
      { label: "포트폴리오", path: "/portfolio", id: "portfolio" },
      { label: "주문·체결", path: "/orders", id: "orders" }
    ]
  },
  {
    title: "System",
    items: [
      { label: "스케줄 현황", path: "/batch", id: "batch" },
      { label: "백테스트", path: "/backtest", id: "backtest" },
      { label: "설정", path: "/settings", id: "settings" }
    ]
  }
];

const opsGroup: MenuGroup = {
  title: "Operations (Admin)",
  items: [
    { label: "데이터 파이프라인", path: "/ops/data", id: "o-data" },
    { label: "알림센터", path: "/ops/alerts", id: "o-alerts" },
    { label: "리스크 리포트", path: "/ops/risk", id: "o-risk" },
    { label: "모델/예측", path: "/ops/model", id: "o-model" },
    { label: "감사 로그", path: "/ops/audit", id: "o-audit" },
    { label: "시스템 헬스", path: "/ops/health", id: "o-health" }
  ]
};

export function AppShell() {
  const auth = useAuth();
  const navigate = useNavigate();

  const groups = auth.role === "Ops" ? [...baseGroups, opsGroup] : baseGroups;

  return (
    <div
      className="min-h-screen bg-[#f9fafb] font-sans text-[#191f28] flex flex-col"
      style={{ scrollbarGutter: "stable" }}
    >
      <header className="bg-white border-b border-[#f2f4f6] px-8 py-4 flex items-center justify-between sticky top-0 z-50 h-[64px]">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-[#3182f6] rounded-lg flex items-center justify-center text-white font-black text-sm">
            C
          </div>
          <h1 className="text-[19px] font-bold tracking-tight text-[#191f28]">
            Investment Choi
          </h1>
          <Badge status={auth.role === "Ops" ? "executed" : "neutral"}>
            {auth.role}
          </Badge>
        </button>

        <div className="flex items-center gap-6 text-[15px] font-semibold text-[#4e5968]">
          <button
            type="button"
            onClick={() => navigate("/mypage")}
            className="cursor-pointer hover:text-[#191f28]"
          >
            마이페이지
          </button>
          <button
            type="button"
            onClick={() => {
              auth.logout();
              navigate("/login");
            }}
            className="cursor-pointer hover:text-[#f04452]"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
        <aside className="w-64 bg-white border-r border-[#f2f4f6] flex flex-col hidden lg:flex">
          <div className="p-6 space-y-8 sticky top-[64px]">
            {groups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="text-[12px] font-bold text-[#8b95a1] px-4">
                  {group.title}
                </h3>
                <div className="flex flex-col gap-1">
                  {group.items.map((m) => (
                    <NavLink
                      key={m.path}
                      to={m.path}
                      className={({ isActive }) =>
                        `text-left px-4 py-2.5 text-[15px] font-semibold rounded-xl transition-all ${
                          isActive
                            ? "bg-[#e8f3ff] text-[#3182f6]"
                            : "text-[#4e5968] hover:bg-[#f2f4f6]"
                        }`
                      }
                    >
                      {m.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-[#f9fafb] border-b border-[#f2f4f6] sticky top-[64px] z-40 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="w-80">
                <SegmentControl
                  options={[
                    { label: "모의계좌 (VIRTUAL)", value: 1 },
                    { label: "실계좌 (REAL)", value: 0 }
                  ]}
                  activeValue={auth.serverType}
                  onChange={auth.setServerType}
                />
              </div>
              <div className="text-[13px] font-medium text-[#8b95a1] hidden md:block">
                최근 업데이트: 2026-02-04 15:51:20
              </div>
            </div>
          </div>

          <main className="px-8 py-10 flex-1">
            <Outlet />
          </main>

          <footer className="px-8 py-10 border-t border-[#f2f4f6] text-[13px] text-[#adb5bd] font-medium text-center">
            © 2026 Investment Choi Auto-Trading Pipeline v4.0.0
          </footer>
        </div>
      </div>
    </div>
  );
}

