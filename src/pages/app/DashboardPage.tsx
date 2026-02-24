import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Power, AlertTriangle } from "lucide-react";
import { useAccountType } from "@/hooks/useAccountType";
import { useCurrentAccountAutoTrade } from "@/hooks/useCurrentAccountAutoTrade";
import { useAuth } from "@/app/AuthContext";
import { Dashboard } from "@/components/Dashboard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { serverType, serverTypeNumeric } = useAccountType();
  const { isAutoTradeOn } = useCurrentAccountAutoTrade(serverTypeNumeric);

  const linkTo = (path: string) => `${path}?serverType=${serverType === "real" ? "0" : "1"}`;
  const onNavigate = (path: string) => navigate(linkTo(path));

  const isAdmin = auth.role === "Admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
        <p className="text-sm text-muted-foreground">
          내 자산·자동투자 상태를 한눈에 확인하세요
        </p>
      </div>

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

      {isAdmin && isAutoTradeOn && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Power className="w-4 h-4 text-destructive" />
              킬스위치 (Ops)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              자동 실행 중인 파이프라인을 즉시 중지합니다.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  자동 실행 긴급 중지
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>자동 실행 중지</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 계좌에 대해 파이프라인을 지금 중지합니다. 실제 주문이 진행 중일 수 있습니다. 계속하시겠습니까?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      // TODO: PUT /api/v1/system/kill-switch or trigger
                    }}
                  >
                    중지
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      <Dashboard
        serverType={serverTypeNumeric}
        hasAccount={true}
        onNavigate={onNavigate}
      />
    </div>
  );
}
