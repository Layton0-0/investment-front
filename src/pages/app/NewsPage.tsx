import { News } from "@/components/Market";

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">뉴스·이벤트</h1>
        <p className="text-sm text-muted-foreground">
          공시·뉴스·센티멘트 요약 및 필터
        </p>
      </div>
      <News />
    </div>
  );
}
