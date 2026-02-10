import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  Newspaper,
  Briefcase,
  ClipboardList,
  Calendar,
  FlaskConical,
  Settings,
  FileText,
  Shield,
  Database,
  AlertTriangle,
  Activity,
  History,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccountType } from "@/hooks/useAccountType";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  opsOnly?: boolean;
}

const userMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "대시보드", path: "/dashboard" },
  { icon: TrendingUp, label: "자동투자 현황", path: "/auto-invest" },
  { icon: LineChart, label: "국내 전략", path: "/strategies/kr" },
  { icon: LineChart, label: "미국 전략", path: "/strategies/us" },
  { icon: Newspaper, label: "뉴스·이벤트", path: "/news" },
  { icon: Briefcase, label: "포트폴리오", path: "/portfolio" },
  { icon: ClipboardList, label: "주문·체결", path: "/orders" },
  { icon: FlaskConical, label: "백테스트", path: "/backtest" },
  { icon: Settings, label: "설정", path: "/settings" },
  { icon: FileText, label: "연말 세금·리포트", path: "/report/tax" },
];

const opsMenuItems: MenuItem[] = [
  { icon: Database, label: "데이터 파이프라인", path: "/ops/data", opsOnly: true },
  { icon: AlertTriangle, label: "알림센터", path: "/ops/alerts", opsOnly: true },
  { icon: Shield, label: "리스크 리포트", path: "/risk", opsOnly: true },
  { icon: Activity, label: "모델/예측 상태", path: "/ops/model", opsOnly: true },
  { icon: History, label: "감사 로그", path: "/ops/audit", opsOnly: true },
  { icon: HeartPulse, label: "시스템 헬스", path: "/ops/health", opsOnly: true },
];

interface AppMenuProps {
  isOps?: boolean;
}

export function AppMenu({ isOps = false }: AppMenuProps) {
  const location = useLocation();
  const { serverType } = useAccountType();

  const getPathWithQuery = (path: string) => {
    return `${path}?serverType=${serverType === "real" ? "0" : "1"}`;
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-56 bg-sidebar min-h-0 flex flex-col border-r border-sidebar-border flex-shrink-0 hidden lg:flex">
      <ScrollArea className="flex-1">
        <nav className="p-3">
          <div className="mb-6">
            <p className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              메뉴
            </p>
            <ul className="space-y-0.5">
              {userMenuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={getPathWithQuery(item.path)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive(item.path)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {isOps && (
            <div>
              <p className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                운영 (Ops)
              </p>
              <ul className="space-y-0.5">
                {opsMenuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={getPathWithQuery(item.path)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive(item.path)
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
}
