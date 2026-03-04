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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  opsOnly?: boolean;
}

/** 퍼블(smart-portfolio-pal) 기준: 메뉴 순서·라벨·경로 일치 */
const userMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "대시보드", path: "/dashboard" },
  { icon: TrendingUp, label: "자동투자 현황", path: "/auto-invest" },
  { icon: LineChart, label: "국내 전략", path: "/strategies/kr" },
  { icon: LineChart, label: "미국 전략", path: "/strategies/us" },
  { icon: Newspaper, label: "뉴스·이벤트", path: "/news" },
  { icon: Briefcase, label: "포트폴리오", path: "/portfolio" },
  { icon: ClipboardList, label: "주문·체결", path: "/orders" },
  { icon: Calendar, label: "스케줄 현황", path: "/batch" },
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
  { icon: History, label: "트레이드 저널", path: "/ops/trade-journal", opsOnly: true },
  { icon: HeartPulse, label: "시스템 헬스", path: "/ops/health", opsOnly: true },
  { icon: Shield, label: "전략 거버넌스", path: "/ops/governance", opsOnly: true },
  { icon: Settings, label: "시스템 설정", path: "/ops/settings", opsOnly: true },
];

interface AppMenuProps {
  isOps?: boolean;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

/** smart-portfolio-pal 퍼블: 사이드바 semantic 토큰 (bg-sidebar-accent, text-sidebar-foreground) */
function menuLinkClass(path: string, isActive: (p: string) => boolean) {
  return cn(
    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors min-h-[44px] min-w-0 touch-manipulation",
    isActive(path)
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
  );
}

function MenuNavContent({
  getPathWithQuery,
  isActive,
  onLinkClick,
  isOps,
}: {
  getPathWithQuery: (path: string) => string;
  isActive: (path: string) => boolean;
  onLinkClick?: () => void;
  isOps: boolean;
}) {
  return (
    <>
      <div className="mb-6">
        <p className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">메뉴</p>
        <ul className="space-y-0.5">
          {userMenuItems.map((item) => (
            <li key={item.path}>
              <Link to={getPathWithQuery(item.path)} className={menuLinkClass(item.path, isActive)} onClick={onLinkClick}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {isOps && (
        <div>
          <p className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">운영 (Ops)</p>
          <ul className="space-y-0.5">
            {opsMenuItems.map((item) => (
              <li key={item.path}>
                <Link to={getPathWithQuery(item.path)} className={menuLinkClass(item.path, isActive)} onClick={onLinkClick}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export function AppMenu({ isOps = false, mobileOpen = false, onMobileOpenChange }: AppMenuProps) {
  const location = useLocation();
  const { serverType } = useAccountType();

  const getPathWithQuery = (path: string) => {
    if (path === "/dashboard") return "/dashboard";
    return `${path}?serverType=${serverType === "real" ? "0" : "1"}`;
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    if (path === "/batch") return location.pathname === "/ops/data";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <aside className="w-56 bg-sidebar min-h-0 flex flex-col border-r border-sidebar-border flex-shrink-0 hidden lg:flex">
        <ScrollArea className="flex-1">
          <nav className="p-3">
            <MenuNavContent getPathWithQuery={getPathWithQuery} isActive={isActive} isOps={isOps} />
          </nav>
        </ScrollArea>
      </aside>

      {onMobileOpenChange && (
        <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
          <SheetContent side="left" className="w-56 p-0 bg-sidebar border-sidebar-border">
            <SheetHeader className="p-4 border-b border-sidebar-border">
              <SheetTitle className="text-sidebar-foreground">메뉴</SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 py-3">
              <nav className="p-3">
                <MenuNavContent
                  getPathWithQuery={getPathWithQuery}
                  isActive={isActive}
                  isOps={isOps}
                  onLinkClick={() => onMobileOpenChange(false)}
                />
              </nav>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
