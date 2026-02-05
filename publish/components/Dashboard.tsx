import React from 'react';
import { TrendingUp, Globe, Newspaper, PieChart, Zap, Settings as SettingsIcon } from 'lucide-react';
import { Card, Button, DataTable, Badge, Stat, Guardrail } from './UI';

export const Dashboard = ({ serverType, hasAccount, onNavigate }: any) => {
  if (!hasAccount) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">?</div>
        <h2 className="text-xl font-bold">등록된 계좌가 없습니다</h2>
        <p className="text-gray-500 max-w-md">투자를 시작하려면 설정 메뉴에서 {serverType === 1 ? '모의계좌' : '실계좌'} API 연동을 완료해주세요.</p>
        <Button onClick={() => onNavigate('settings')}>계좌 설정하러 가기</Button>
      </div>
    );
  }

  const mockStatsVirtual = [
    { label: '모의 총 자산', value: '₩1,245,670,000', trend: 'positive' },
    { label: '모의 수익률', value: '+2.35%', trend: 'positive' },
  ];

  const mockStatsLossExample = [
    { label: '모의 총 자산', value: '₩980,500,000', trend: 'negative' },
    { label: '손실 금액 (예시)', value: '-₩1,230,000', trend: 'negative' },
  ];

  const mockStatsReal = [
    { label: '실계좌 총 자산', value: '₩45,000,000', trend: 'positive' },
    { label: '실계좌 수익률', value: '+0.12%', trend: 'neutral' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Menu */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: '국내전략', icon: TrendingUp, path: '/strategies/kr' },
          { label: '미국전략', icon: Globe, path: '/strategies/us' },
          { label: '뉴스·이벤트', icon: Newspaper, path: '/news' },
          { label: '포트폴리오', icon: PieChart, path: '/portfolio' },
          { label: '주문·체결', icon: Zap, path: '/orders' },
          { label: '설정', icon: SettingsIcon, path: '/settings' },
        ].map((item, idx) => (
          <button 
            key={idx} 
            onClick={() => onNavigate(item.path)}
            className="p-6 bg-white rounded-2xl shadow-[0_8px_24px_rgba(149,157,165,0.05)] hover:shadow-[0_8px_24px_rgba(149,157,165,0.12)] transition-all text-left flex flex-col justify-between h-32 group border border-transparent hover:border-[#3182f6]/20"
          >
            <item.icon className="w-6 h-6 text-[#3182f6] opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="text-[16px] font-bold text-[#191f28]">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="모의계좌 요약 (수익)">
          <div className="grid grid-cols-2 gap-4">
            {mockStatsVirtual.map((s, i) => <Stat key={i} {...s as any} />)}
            <div className="col-span-2 mt-2 p-4 bg-[#f2f4f6] rounded-xl flex justify-between items-center">
              <Badge status="active">AUTO-TRADING ON</Badge>
              <span className="text-[12px] text-[#4e5968] font-bold">KR 120 / US 80</span>
            </div>
          </div>
        </Card>
        <Card title="모의계좌 요약 (손실 예시)">
          <div className="grid grid-cols-2 gap-4">
            {mockStatsLossExample.map((s, i) => <Stat key={i} {...s as any} />)}
            <div className="col-span-2 mt-2 p-4 bg-[#fff0f0] rounded-xl flex justify-between items-center border border-[#f04452]/10">
              <Badge status="failed">UNDER PERFORMING</Badge>
              <span className="text-[12px] text-[#f04452] font-bold">손실 추적 중</span>
            </div>
          </div>
        </Card>
        <Card title="실계좌 요약 (Real)">
          <div className="grid grid-cols-2 gap-4">
            {mockStatsReal.map((s, i) => <Stat key={i} {...s as any} />)}
            <div className="col-span-2 mt-2 p-4 bg-[#f2f4f6] rounded-xl flex justify-between items-center">
              <Badge status="stopped">AUTO-TRADING OFF</Badge>
              <span className="text-[12px] text-[#4e5968] font-bold">연동 필요</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="보유 잔고 (Top 5)">
          <DataTable 
            headers={['종목', '수량', '평균단가', '현재가', '수익률']}
            rows={[
              ['삼성전자', '100', '72,000', '74,500', '+3.4%'],
              ['SK하이닉스', '50', '160,000', '158,000', '-1.2%'],
              ['AAPL', '10', '$180.2', '$192.5', '+6.8%'],
              ['NVDA', '5', '$620.1', '$750.3', '+21.0%'],
              ['TQQQ', '20', '$52.4', '$58.1', '+10.8%'],
            ]}
          />
        </Card>

        <Card title="최근 주문 현황">
          <DataTable 
            headers={['시간', '종목', '구분', '가격', '상태']}
            rows={[
              ['14:20:01', 'AAPL', '매수', '$192.1', '체결'],
              ['14:15:33', '삼성전자', '매도', '74,500', '체결'],
              ['11:05:12', 'NVDA', '매수', '$745.0', '체결'],
              ['09:30:45', 'TQQQ', '매수', '$57.9', '체결'],
              ['09:01:20', '005930', '매수', '74,200', '실패'],
            ]}
          />
        </Card>
      </div>

      <Guardrail message="현재 서버는 Dry-Run 모드입니다. 실제 주문은 서버 설정(PIPELINE_AUTO_EXECUTE)이 필요합니다." type="info" />
    </div>
  );
};
