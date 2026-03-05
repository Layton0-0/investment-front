import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useAccountType } from "@/hooks/useAccountType";
import { useCurrentAccountAutoTrade } from "@/hooks/useCurrentAccountAutoTrade";
import { useAuth } from "@/app/AuthContext";
import { Dashboard } from "@/components/Dashboard";
import { putKillSwitch } from "@/api/systemApi";

export default function DashboardPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { serverType, serverTypeNumeric } = useAccountType();
  const { isAutoTradeOn } = useCurrentAccountAutoTrade(serverTypeNumeric);

  const linkTo = (path: string) => `${path}?serverType=${serverType === "real" ? "0" : "1"}`;
  const onNavigate = (path: string) => navigate(linkTo(path));

  const isAdmin = auth.role === "Admin";
  const [killSwitchMessage, setKillSwitchMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleKillSwitchConfirm = async () => {
    setKillSwitchMessage(null);
    try {
      await putKillSwitch({ haltAllOrders: true });
      setKillSwitchMessage({ type: "success", text: "자동 실행이 중지되었습니다." });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "킬스위치 설정에 실패했습니다.";
      setKillSwitchMessage({ type: "error", text: msg });
    }
  };

  const globalNavItems = [
    { label: "국내 전략", path: "/strategies/kr" },
    { label: "미국 전략", path: "/strategies/us" },
    { label: "뉴스", path: "/news" },
    { label: "포트폴리오", path: "/portfolio" },
    { label: "주문·체결", path: "/orders" },
    { label: "설정", path: "/settings" },
  ] as const;

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">
          모의계좌 국내 미국 포트폴리오 현황
        </p>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="글로벌 메뉴">
        {globalNavItems.map(({ label, path }) => (
          <Link
            key={path}
            to={linkTo(path)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>

      {!isAutoTradeOn && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">자동 매매 OFF</p>
              <p className="text-xs text-muted-foreground">
                주문이 나가지 않습니다. 설정에서 자동 매매를 켜세요.
              </p>
            </div>
            <Link to={linkTo("/settings")}>
              <Button variant="outline" size="sm">설정으로 이동</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Dashboard
        serverType={serverTypeNumeric}
        hasAccount={true}
        onNavigate={onNavigate}
        isAdmin={isAdmin}
        killSwitchMessage={killSwitchMessage}
        onKillSwitchConfirm={handleKillSwitchConfirm}
      />
    </div>
  );
}
