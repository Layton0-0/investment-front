import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, AlertTriangle } from "lucide-react";

export default function TaxReportPage() {
  const [year, setYear] = useState("2024");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">연말 세금·리포트</h1>
          <p className="text-sm text-muted-foreground">연간 투자 수익 및 세금 요약</p>
        </div>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024년</SelectItem>
            <SelectItem value="2023">2023년</SelectItem>
            <SelectItem value="2022">2022년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">연간 실현손익 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">총 실현손익</p>
              <p className="text-2xl font-bold text-success">+₩8,450,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">국내 실현손익</p>
              <p className="text-xl font-bold text-success">+₩3,200,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">해외 실현손익</p>
              <p className="text-xl font-bold text-success">+₩5,250,000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">국내/해외 구분 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">구분</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">손익</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-2 font-medium">국내 주식</td>
                  <td className="py-3 px-2 text-right text-success font-medium">+₩3,200,000</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-2 font-medium">해외 주식</td>
                  <td className="py-3 px-2 text-right text-success font-medium">+₩5,250,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">배당 소득 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">총 배당금</p>
          <p className="text-xl font-bold">₩1,850,000</p>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" disabled>
          <Download className="w-4 h-4 mr-2" />
          CSV 내보내기
        </Button>
        <Button variant="outline" disabled>
          <Download className="w-4 h-4 mr-2" />
          PDF 내보내기
        </Button>
      </div>

      <Card className="border-muted bg-muted/30">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">면책 안내</p>
            <p>본 자료는 가정·한계가 있으며 세무 자문이 아닙니다. 신고 시 전문가 확인을 권장합니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
