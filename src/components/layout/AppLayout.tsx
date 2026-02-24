import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { AppMenu } from "./AppMenu";
import { AccountTabs } from "./AccountTabs";
import { useAuth } from "@/app/AuthContext";

/** 모의/실계좌 구분이 필요한 경로에서만 계좌 탭 표시 */
function useShowAccountTabs(): boolean {
  const { pathname } = useLocation();
  return (
    pathname === "/settings" ||
    pathname === "/auto-invest" ||
    pathname.startsWith("/strategies/") ||
    pathname === "/orders"
  );
}

export function AppLayout() {
  const auth = useAuth();
  const isAdmin = auth.role === "Admin";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const showAccountTabs = useShowAccountTabs();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      <div className="flex flex-1 min-h-0">
        <AppMenu isOps={isAdmin} mobileOpen={mobileMenuOpen} onMobileOpenChange={setMobileMenuOpen} />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden min-w-0">
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50">
            {showAccountTabs ? <AccountTabs /> : <div className="flex-1" />}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              연결됨
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="max-w-[1200px] mx-auto w-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
