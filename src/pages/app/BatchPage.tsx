import { Batch } from "@/components/Ops";
import { useAuth } from "@/app/AuthContext";

export default function BatchPage() {
  const auth = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">스케줄 현황</h1>
        <p className="text-sm text-muted-foreground">
          스케줄러 작업 목록·cron·다음 실행
        </p>
      </div>
      <Batch role={auth.role} />
    </div>
  );
}
