import React from 'react';
import { Card, DataTable, Button, Input, FilterBar, Badge } from './UI';

export const News = () => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-4 border border-gray-200">
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <Input label="원천" placeholder="전체" />
        <Input label="시장" placeholder="KR/US" />
        <Input label="기간" type="date" />
        <Input label="종목명" placeholder="AAPL..." />
      </div>
      <Button>필터 적용</Button>
    </div>

    <Card title="시장 뉴스 및 공시 목록">
      <DataTable 
        headers={['시간', '시장', '종목', '구분', '제목', '감정']}
        rows={[
          ['15:30', 'US', 'AAPL', '공시', '분기 실적 발표: 예상치 상회', '호재'],
          ['14:20', 'KR', '005930', '뉴스', '삼성전자, 차세대 반도체 로드맵 공개', '중립'],
          ['11:05', 'US', 'NVDA', '뉴스', 'AI 칩 수요 폭증에 따른 목표가 상향', '호재'],
          ['09:00', 'KR', '-', '시황', '코스피 개장 상황: 보합세 유지', '중립'],
        ]}
      />
    </Card>
  </div>
);

export const Portfolio = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card title="자산 배분 현황" className="md:col-span-1">
        <div className="flex flex-col gap-4">
          <div className="h-48 rounded-full border-[12px] border-[#f2f4f6] relative flex items-center justify-center">
            <div className="text-center">
              <div className="text-[12px] font-bold text-[#8b95a1]">총 자산</div>
              <div className="text-[18px] font-bold text-[#191f28]">₩12.4억</div>
            </div>
            {/* Simple representation of colored segments */}
            <div className="absolute inset-0 border-[12px] border-t-[#3182f6] border-r-[#f04452] border-b-[#ff9500] rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center gap-2 text-[12px] font-bold">
              <div className="w-3 h-3 rounded-full bg-[#3182f6]"></div> 미국 주식 (45%)
            </div>
            <div className="flex items-center gap-2 text-[12px] font-bold">
              <div className="w-3 h-3 rounded-full bg-[#f04452]"></div> 한국 주식 (30%)
            </div>
            <div className="flex items-center gap-2 text-[12px] font-bold">
              <div className="w-3 h-3 rounded-full bg-[#ff9500]"></div> 안전 자산 (25%)
            </div>
          </div>
        </div>
      </Card>
      <Card title="보유 종목 상세" className="md:col-span-2">
        <DataTable 
          headers={['종목', '비중', '평가금액', '수익률', '매수일']}
          rows={[
            [<div className="flex items-center gap-2"><div className="w-6 h-6 bg-[#f2f4f6] rounded-full flex items-center justify-center text-[10px]">T</div>TQQQ</div>, '35%', '₩420,000,000', <span className="text-[#f04452]">+12.5%</span>, '2024-01-10'],
            [<div className="flex items-center gap-2"><div className="w-6 h-6 bg-[#f2f4f6] rounded-full flex items-center justify-center text-[10px]">A</div>AAPL</div>, '25%', '₩310,000,000', <span className="text-[#f04452]">+5.2%</span>, '2024-01-15'],
            [<div className="flex items-center gap-2"><div className="w-6 h-6 bg-[#f2f4f6] rounded-full flex items-center justify-center text-[10px]">S</div>삼성전자</div>, '20%', '₩240,000,000', <span className="text-[#3182f6]">-2.1%</span>, '2024-02-01'],
            [<div className="flex items-center gap-2"><div className="w-6 h-6 bg-[#f2f4f6] rounded-full flex items-center justify-center text-[10px]">C</div>CASH</div>, '20%', '₩240,000,000', '-', '-'],
          ]}
        />
      </Card>
    </div>

    <Card title="AI 모델 추천 포트폴리오 (Rebalance)">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs text-gray-500 font-medium">현재 시장 상황(Bullish)에 따른 추천 비중 조절안입니다.</p>
        <Button variant="secondary" className="text-xs">전체 적용 (Confirmed)</Button>
      </div>
      <DataTable 
        headers={['종목', '현재비중', '추천비중', '변동량', '사유']}
        rows={[
          ['NVDA', '0%', '15%', '+15%', '모멘텀 강화'],
          ['TQQQ', '35%', '40%', '+5%', '강세장 지속'],
          ['삼성전자', '20%', '10%', '-10%', '상대적 약세'],
        ]}
      />
    </Card>
  </div>
);

export const Orders = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Button variant="secondary" className="text-xs">전체</Button>
        <Button variant="ghost" className="text-xs">체결</Button>
        <Button variant="ghost" className="text-xs">미체결</Button>
      </div>
      <Button variant="danger" className="text-xs">미체결 전체 취소</Button>
    </div>

    <Card title="주문 및 체결 내역">
      <DataTable 
        headers={['주문시간', '종목', '구분', '가격', '수량', '상태', '관리']}
        rows={[
          ['15:45:01', 'AAPL', '매수', '$192.5', '10', '체결', '-'],
          ['15:40:22', 'TSLA', '매수', '$185.0', '5', '미체결', <Button variant="ghost" className="text-red-600 text-[10px] p-0 underline">취소</Button>],
          ['14:20:11', '005930', '매도', '74,500', '100', '체결', '-'],
          ['09:05:33', 'NVDA', '매수', '$740.0', '2', '체결', '-'],
        ]}
      />
    </Card>
  </div>
);
