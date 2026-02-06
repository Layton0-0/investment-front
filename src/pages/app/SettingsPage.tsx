import { useAccountType } from "@/hooks/useAccountType";
import { Settings } from "@/components/System";

export default function SettingsPage() {
  const { serverTypeNumeric } = useAccountType();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">설정</h1>
        <p className="text-sm text-muted-foreground">
          계좌·API·거래 설정·자동투자 ON/OFF
        </p>
      </div>
      <Settings serverType={serverTypeNumeric} />
    </div>
  );
}
