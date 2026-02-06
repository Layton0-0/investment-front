import { Orders } from "@/components/Market";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">주문·체결</h1>
        <p className="text-sm text-muted-foreground">
          주문 목록·체결 내역·미체결 취소
        </p>
      </div>
      <Orders />
    </div>
  );
}
