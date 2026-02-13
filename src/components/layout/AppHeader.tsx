import { Link, useNavigate } from "react-router-dom";
import { Shield, User, LogOut, Bell, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/AuthContext";
import { useAccountType } from "@/hooks/useAccountType";

interface AppHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function AppHeader({ onOpenMobileMenu }: AppHeaderProps) {
  const navigate = useNavigate();
  const auth = useAuth();
  const { serverType } = useAccountType();

  const dashboardPath = `/dashboard?serverType=${serverType === "real" ? "0" : "1"}`;

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <header className="h-14 sm:h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden flex-shrink-0 p-2 rounded-md hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link to={dashboardPath} className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-base sm:text-lg font-bold text-foreground truncate">Pulsarve</span>
      </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <Button variant="ghost" size="icon" className="relative" aria-label="알림">
          <Bell className="w-5 h-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{auth.username ?? "User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate(`/mypage?serverType=${serverType === "real" ? "0" : "1"}`)}>
              마이페이지
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
