import React from 'react';
import { Card, DataTable, Badge, Button } from './UI';

export const OpsDashboard = ({ subPage }: { subPage: string }) => {
  const renderContent = () => {
    switch (subPage) {
      case 'data':
        return (
          <div className="space-y-4">
            <Card title="데이터 파이프라인 현황">
              <DataTable 
                headers={['Source', 'Type', 'Last Sync', 'Status', 'Latency']}
                rows={[
                  ['KRX', 'Quotes', '0.5s ago', 'ACTIVE', '12ms'],
                  ['Yahoo Finance', 'Quotes', '2.1s ago', 'ACTIVE', '450ms'],
                  ['NewsAPI', 'News', '5m ago', 'ACTIVE', '1.2s'],
                  ['OpenAI', 'Sentiment', '12m ago', 'IDLE', '-'],
                ]}
              />
            </Card>
          </div>
        );
      case 'alerts':
        return (
          <div className="space-y-4">
            <Card title="시스템 알림 내역">
              <DataTable 
                headers={['발생시간', '등급', '구성요소', '메시지', '상태']}
                rows={[
                  ['15:45:11', <Badge status="failed">CRITICAL</Badge>, 'RiskGate', '일일 손실 한도 도달 (85% 경고)', '확인 대기'],
                  ['15:30:00', <Badge status="active">INFO</Badge>, 'Scheduler', '미국 시장 개장 동기화 완료', '처리 완료'],
                  ['14:20:01', <Badge status="failed">ERROR</Badge>, 'Execution', 'AAPL 매수 주문 실패: API 제한 초과', '재시도 중'],
                  ['12:10:45', <Badge status="active">INFO</Badge>, 'Strategy', 'ST-KR-001 유니버스 필터링 완료', '처리 완료'],
                ]}
              />
            </Card>
          </div>
        );
      case 'risk':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#f2f4f6]">
                <div className="text-[13px] font-bold text-[#8b95a1] mb-1">VaR (95%)</div>
                <div className="text-2xl font-bold text-[#191f28]">₩45.2M</div>
                <div className="text-[12px] text-[#f04452] font-bold mt-2">↑ 5.2% vs Yesterday</div>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#f2f4f6]">
                <div className="text-[13px] font-bold text-[#8b95a1] mb-1">최대 낙폭 (MDD)</div>
                <div className="text-2xl font-bold text-[#00D47E]">12.5%</div>
                <div className="text-[12px] text-[#3182f6] font-bold mt-2">Within Limit (15%)</div>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#f2f4f6]">
                <div className="text-[13px] font-bold text-[#8b95a1] mb-1">레버리지 비율</div>
                <div className="text-2xl font-bold text-[#191f28]">1.12x</div>
                <div className="text-[12px] text-[#00D47E] font-bold mt-2">Safe Zone</div>
              </div>
            </div>
            <Card title="리스크 관리 상세">
              <DataTable 
                headers={['리스크 항목', '현재 수치', '임계치', '상태']}
                rows={[
                  ['일일 손실 제한', '1.2%', '2.0%', <Badge status="active">정상</Badge>],
                  ['종목별 집중도', '15.4%', '20.0%', <Badge status="active">정상</Badge>],
                  ['시장 변동성 (VIX)', '24.2', '30.0%', <Badge status="active">주의</Badge>],
                ]}
              />
            </Card>
          </div>
        );
      case 'health':
        return <HealthView />;
      case 'data':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#f2f4f6]">
                <div className="text-[12px] font-bold text-[#8b95a1] mb-1">총 수집 데이터</div>
                <div className="text-xl font-bold text-[#191f28]">1.2TB</div>
              </div>
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#f2f4f6]">
                <div className="text-[12px] font-bold text-[#8b95a1] mb-1">실시간 처리량</div>
                <div className="text-xl font-bold text-[#3182f6]">450 req/s</div>
              </div>
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#f2f4f6]">
                <div className="text-[12px] font-bold text-[#8b95a1] mb-1">활성 커넥션</div>
                <div className="text-xl font-bold text-[#00D47E]">12 Nodes</div>
              </div>
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#f2f4f6]">
                <div className="text-[12px] font-bold text-[#8b95a1] mb-1">평균 지연시간</div>
                <div className="text-xl font-bold text-[#191f28]">14ms</div>
              </div>
            </div>
            <Card title="데이터 파이프라인 실시간 현황">
              <DataTable 
                headers={['데이터 소스', '유형', '마지막 동기화', '상태', '처리속도', '액션']}
                rows={[
                  ['KRX 실시간 시세', 'Quotes', '0.1s ago', <Badge status="active">연결됨</Badge>, '12ms', <Button variant="secondary" className="py-1 px-3 text-[12px]">로그</Button>],
                  ['Yahoo Finance API', 'Market Data', '2.5s ago', <Badge status="active">연결됨</Badge>, '450ms', <Button variant="secondary" className="py-1 px-3 text-[12px]">로그</Button>],
                  ['NewsAPI (Global)', 'News/RSS', '5m ago', <Badge status="active">대기중</Badge>, '1.2s', <Button variant="secondary" className="py-1 px-3 text-[12px]">로그</Button>],
                  ['DART 공시 정보', 'Crawl', '12m ago', <Badge status="stopped">점검중</Badge>, '-', <Button variant="primary" className="py-1 px-3 text-[12px]">재시작</Button>],
                ]}
              />
            </Card>
            <Card title="파이프라인 아키텍처 (Flow)">
              <div className="flex items-center justify-around py-8 bg-[#f9fafb] rounded-2xl border border-dashed border-[#d1d6db]">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-[#3182f6]">SRC</div>
                  <span className="text-[11px] font-bold text-[#8b95a1]">Sources</span>
                </div>
                <div className="w-12 h-px bg-[#d1d6db]"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-[#3182f6] rounded-xl shadow-sm flex items-center justify-center font-bold text-white">ETL</div>
                  <span className="text-[11px] font-bold text-[#8b95a1]">Processing</span>
                </div>
                <div className="w-12 h-px bg-[#d1d6db]"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-[#00D47E]">DB</div>
                  <span className="text-[11px] font-bold text-[#8b95a1]">Storage</span>
                </div>
              </div>
            </Card>
          </div>
        );
      case 'model':
        return (
          <div className="space-y-6">
            <Card title="AI 모델 학습 및 예측 성능">
              <DataTable 
                headers={['모델 식별자', '알고리즘', '대상 시장', '정확도 (ACC)', '상태', '배포 버전']}
                rows={[
                  ['M-KR-V1-XG', 'XGBoost', 'KOSPI 200', <span className="text-[#3182f6] font-bold">68.4%</span>, <Badge status="active">운영중</Badge>, 'v2.4.1'],
                  ['M-US-V2-LS', 'LSTM', 'NASDAQ 100', <span className="text-[#3182f6] font-bold">72.1%</span>, <Badge status="active">운영중</Badge>, 'v3.1.0'],
                  ['R-ETF-01-RL', 'Reinforcement', 'Multi-Asset', <span className="text-[#8b95a1]">64.0%</span>, <Badge status="pending">학습중</Badge>, 'beta-01'],
                ]}
              />
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="모델별 수익 예측 편차">
                <div className="h-48 bg-[#f9fafb] rounded-xl flex items-center justify-center text-[13px] text-[#8b95a1] border border-dashed border-[#d1d6db]">
                  [ 예측 오차율 차트 Placeholder ]
                </div>
              </Card>
              <Card title="훈련 데이터셋 분포">
                <div className="h-48 bg-[#f9fafb] rounded-xl flex items-center justify-center text-[13px] text-[#8b95a1] border border-dashed border-[#d1d6db]">
                  [ 데이터 분포 히스토그램 Placeholder ]
                </div>
              </Card>
            </div>
          </div>
        );
      case 'audit':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[15px] font-bold text-[#191f28]">보안 감사 및 활동 로그</h3>
              <Button variant="secondary" className="py-1 px-4 text-[12px]">로그 내보내기 (CSV)</Button>
            </div>
            <Card title="">
              <DataTable 
                headers={['로그 시간', '사용자', '수행 작업', 'IP 주소', '결과', '위험도']}
                rows={[
                  ['2024-02-04 15:50:11', 'admin', '전략 파라미터 수정', '121.1.2.3', <span className="text-[#3182f6]">SUCCESS</span>, <Badge status="neutral">LOW</Badge>],
                  ['2024-02-04 15:48:22', 'user1', '수동 주문 실행', '182.4.5.6', <span className="text-[#3182f6]">SUCCESS</span>, <Badge status="pending">MID</Badge>],
                  ['2024-02-04 15:45:01', 'system', '자동 매매 엔진 재시작', '-', <span className="text-[#3182f6]">SUCCESS</span>, <Badge status="neutral">LOW</Badge>],
                  ['2024-02-04 15:30:15', 'unknown', '로그인 시도 실패', '45.1.2.9', <span className="text-[#f04452]">FAILED</span>, <Badge status="failed">HIGH</Badge>],
                ]}
              />
            </Card>
          </div>
        );
      default:
        return <div>Select an Ops page</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <h2 className="text-lg font-bold uppercase tracking-tight">Ops: {subPage.toUpperCase()}</h2>
        <div className="flex gap-2">
          <Badge status="active">MASTER NODE: ALIVE</Badge>
          <Badge status="pending">SLAVE NODE: SYNCING</Badge>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

const HealthView = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <HealthCard label="CPU" value="12%" status="GOOD" />
      <HealthCard label="RAM" value="4.2GB" status="GOOD" />
      <HealthCard label="Latency" value="15ms" status="GOOD" />
    </div>
    <div className="mt-4 border border-gray-200 p-4 font-mono text-xs bg-gray-50 overflow-y-auto max-h-60">
      [2024-02-04 15:46:01] System health heartbeat: OK<br/>
      [2024-02-04 15:45:01] Database connected: latency 2ms<br/>
      [2024-02-04 15:44:01] Redis cache: HIT 94%<br/>
      [2024-02-04 15:43:01] External API: KRX UP, Yahoo UP<br/>
      [2024-02-04 15:42:01] Memory usage stable at 4.2GB<br/>
      [2024-02-04 15:41:01] All microservices reporting healthy status
    </div>
  </div>
);

const HealthCard = ({ label, value, status }: any) => (
  <div className="border border-gray-200 p-3 bg-white">
    <div className="text-[10px] font-bold text-gray-400 uppercase">{label}</div>
    <div className="flex justify-between items-end mt-1">
      <div className="text-lg font-mono font-bold">{value}</div>
      <div className="text-[9px] font-bold text-gray-800">{status}</div>
    </div>
  </div>
);

export const Batch = ({ role }: { role: string }) => {
  const isOps = role === 'Ops';
  return (
    <div className="space-y-6">
      <Card title="스케줄 현황 (Batch Jobs)">
        <DataTable 
          headers={['작업명', '스케줄', '최근 실행', '상태', '액션']}
          rows={[
            ['국내 유니버스 갱신', '매일 08:30', '4시간 전', <Badge status="active">성공</Badge>, isOps ? <Button variant="primary" className="text-[12px] py-1.5 px-4 rounded-lg shadow-md bg-[#3182f6]">즉시 실행</Button> : '-'],
            ['미국 시장 동기화', '매일 23:30', '16시간 전', <Badge status="active">성공</Badge>, isOps ? <Button variant="primary" className="text-[12px] py-1.5 px-4 rounded-lg shadow-md bg-[#3182f6]">즉시 실행</Button> : '-'],
            ['계좌 리밸런싱', '매주 월요일', '3일 전', <Badge status="active">성공</Badge>, isOps ? <Button variant="primary" className="text-[12px] py-1.5 px-4 rounded-lg shadow-md bg-[#3182f6]">즉시 실행</Button> : '-'],
            ['데이터 백업', '매일 04:00', '12시간 전', <Badge status="failed">실패</Badge>, isOps ? <Button variant="danger" className="text-[12px] py-1.5 px-4 rounded-lg shadow-md">재시도</Button> : '-'],
          ]}
        />
      </Card>
      {!isOps && (
        <Guardrail message="작업 제어 권한이 없습니다. 운영자 계정으로 로그인해주세요." type="info" />
      )}
    </div>
  );
};
