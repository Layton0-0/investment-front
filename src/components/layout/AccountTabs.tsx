import { useAccountType } from "@/hooks/useAccountType";
import { cn } from "@/lib/utils";
import { TestTube, Building2 } from "lucide-react";

export function AccountTabs() {
  const { setServerType, isMock, isReal } = useAccountType();

  return (
    <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1">
      <button
        type="button"
        onClick={() => setServerType("mock")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
          isMock
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-card/50"
        )}
      >
        <TestTube className="w-4 h-4" />
        모의계좌
      </button>
      <button
        type="button"
        onClick={() => setServerType("real")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
          isReal
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-card/50"
        )}
      >
        <Building2 className="w-4 h-4" />
        실계좌
      </button>
    </div>
  );
}
