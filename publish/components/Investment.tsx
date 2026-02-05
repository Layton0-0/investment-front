import React from 'react';
import { Card, DataTable, Badge, Guardrail } from './UI';

export const AutoInvest = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="01. 유니버스">
          <div className="text-center py-4">
            <div className="text-2xl font-mono font-bold">120 / 80</div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">KR / US ITEMS</div>
          </div>
        </Card>
        <Card title="02. 시그널">
          <div className="text-center py-4">
            <div className="text-2xl font-mono font-bold">12 / 7</div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">BUY SIGNALS</div>
          </div>
        </Card>
        <Card title="03. 자금관리">
          <div className="text-center py-4">
            <div className="text-2xl font-mono font-bold">15% / 20%</div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">ALLOCATION / CASH</div>
          </div>
        </Card>
        <Card title="04. 매매실행">
          <div className="text-center py-4">
            <div className="text-2xl font-mono font-bold">4</div>
            <div className="text-[10px] text-gray-500 uppercase mt-1">OPEN POSITIONS</div>
          </div>
        </Card>
      </div>

      <Card title="실시간 시그널 발생 내역">
        <DataTable 
          headers={['시간', '시장', '종목', '전략', '시그널', '강도']}
          rows={[
            ['15:30:00', 'US', 'AAPL', 'Trend-Follow', 'BUY', 'High'],
            ['15:28:45', 'US', 'TSLA', 'Mean-Revert', 'SELL', 'Medium'],
            ['09:15:20', 'KR', '005930', 'Volatility-Break', 'BUY', 'High'],
            ['09:12:11', 'KR', '000660', 'Momentum', 'BUY', 'Low'],
          ]}
        />
      </Card>

      <Card title="현재 파이프라인 포지션">
        <DataTable 
          headers={['종목', '진입일', '수량', '진입가', '현재가', '상태']}
          rows={[
            ['AAPL', '2024-02-01', '10', '$185', '$192.5', 'HOLD'],
            ['NVDA', '2024-01-25', '5', '$610', '$750.3', 'HOLD'],
            ['TQQQ', '2024-02-02', '20', '$54', '$58.1', 'HOLD'],
            ['삼성전자', '2024-02-04', '100', '73,500', '74,500', 'NEW'],
          ]}
        />
      </Card>

      <Guardrail message="신규 매수 축소/중단: 리스크 게이트 발동 (일일 손실 한도 근접)" type="error" />
    </div>
  );
};

export const Strategy = ({ market }: { market: 'kr' | 'us' }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-[#191f28]">{market === 'kr' ? '국내' : '미국'} 전략 목록</h2>
      <Badge status="active">시스템 정상 작동 중</Badge>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2].map(i => (
        <Card key={i} title={`전략 ST-${market.toUpperCase()}-00${i}`}>
          <div className="space-y-4">
            <p className="text-[14px] text-[#4e5968] leading-relaxed">모멘텀 및 변동성 돌파 기반 {market === 'kr' ? 'KOSPI200' : 'NASDAQ100'} 트레이딩</p>
            <div className="grid grid-cols-2 gap-2 text-[13px] font-semibold">
              <div className="text-[#8b95a1]">전략 타입</div>
              <div className="text-right text-[#333d4b]">Long-Term</div>
              <div className="text-[#8b95a1]">상태</div>
              <div className="text-right"><Badge status="active">RUNNING</Badge></div>
            </div>
            <div className="pt-4 flex gap-2">
              <Button variant="secondary" className="flex-1 py-2 text-[13px]">상세보기</Button>
            </div>
          </div>
        </Card>
      ))}
      <Card title={`전략 ST-${market.toUpperCase()}-003 (점검 중)`}>
        <div className="space-y-4 opacity-60">
          <p className="text-[14px] text-[#4e5968] leading-relaxed">알고리즘 고도화 작업으로 인한 일시 중단</p>
          <div className="grid grid-cols-2 gap-2 text-[13px] font-semibold">
            <div className="text-[#8b95a1]">전략 타입</div>
            <div className="text-right text-[#333d4b]">Medium-Term</div>
            <div className="text-[#8b95a1]">상태</div>
            <div className="text-right"><Badge status="stopped">INACTIVE</Badge></div>
          </div>
          <div className="pt-4">
            <Button variant="ghost" className="w-full py-2 text-[13px]" disabled>재개 대기 중</Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
);
