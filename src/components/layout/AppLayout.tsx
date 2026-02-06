import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { AppMenu } from "./AppMenu";
import { AccountTabs } from "./AccountTabs";
import { useAuth } from "@/app/AuthContext";

export function AppLayout() {
  const auth = useAuth();
  const isOps = auth.role === "Ops";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />

      <div className="flex flex-1 min-h-0">
        <AppMenu isOps={isOps} />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden min-w-0">
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50">
            <AccountTabs />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              연결됨
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-[1200px] mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
