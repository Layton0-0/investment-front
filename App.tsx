import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { AutoInvest, Strategy } from './components/Investment';
import { Settings, Backtest } from './components/System';
import { OpsDashboard, Batch } from './components/Ops';
import { Button, Card, Input, SegmentControl, Badge } from './components/UI';

// --- Auth Components ---
const Login = ({ onLogin, onSwitch }: any) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <Card className="w-full max-w-sm shadow-sm" title="INVESTMENT CHOI - LOGIN">
      <div className="space-y-4 py-4">
        <Input label="ID" placeholder="admin / user" />
        <Input label="Password" type="password" placeholder="••••••••" />
        <Button className="w-full" onClick={() => onLogin('User')}>USER LOGIN</Button>
        <Button className="w-full" variant="secondary" onClick={() => onLogin('Ops')}>OPS LOGIN</Button>
        <div className="text-center text-[10px] text-gray-400 uppercase pt-4 border-t border-gray-100">
          Not a member? <button onClick={onSwitch} className="underline cursor-pointer">Sign up</button>
        </div>
      </div>
    </Card>
  </div>
);

const Signup = ({ onBack }: any) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <Card className="w-full max-w-sm shadow-sm" title="INVESTMENT CHOI - SIGNUP">
      <div className="space-y-4 py-4">
        <Input label="Name" placeholder="John Doe" />
        <Input label="Email" placeholder="email@example.com" />
        <Input label="Password" type="password" placeholder="••••••••" />
        <Input label="Account Number" placeholder="123-456-789" />
        <div className="flex gap-2">
          <Button className="w-full">Create Account</Button>
        </div>
        <div className="text-center text-[10px] text-gray-400 uppercase pt-4 border-t border-gray-100">
          Already have an account? <button onClick={onBack} className="underline cursor-pointer">Login</button>
        </div>
      </div>
    </Card>
  </div>
);

// --- Layout Components ---
const Sidebar = ({ currentPath, onNavigate, role }: any) => {
  const groups = [
    {
      title: "Investment",
      items: [
        { label: '대시보드', path: '/', id: 'dashboard' },
        { label: '자동투자 현황', path: '/auto-invest', id: 'auto' },
        { label: '국내 전략', path: '/strategies/kr', id: 'kr' },
        { label: '미국 전략', path: '/strategies/us', id: 'us' },
        { label: '뉴스·이벤트', path: '/news', id: 'news' },
        { label: '포트폴리오', path: '/portfolio', id: 'portfolio' },
        { label: '주문·체결', path: '/orders', id: 'orders' },
      ]
    },
    {
      title: "System",
      items: [
        { label: '스케줄 현황', path: '/batch', id: 'batch' },
        { label: '백테스트', path: '/backtest', id: 'backtest' },
        { label: '설정', path: '/settings', id: 'settings' },
      ]
    }
  ];

  const opsGroup = {
    title: "Operations (Admin)",
    items: [
      { label: '데이터 파이프라인', path: '/ops/data', id: 'o-data' },
      { label: '알림센터', path: '/ops/alerts', id: 'o-alerts' },
      { label: '리스크 리포트', path: '/ops/risk', id: 'o-risk' },
      { label: '모델/예측', path: '/ops/model', id: 'o-model' },
      { label: '감사 로그', path: '/ops/audit', id: 'o-audit' },
      { label: '시스템 헬스', path: '/ops/health', id: 'o-health' },
    ]
  };

  const allGroups = role === 'Ops' ? [...groups, opsGroup] : groups;

  return (
    <aside className="w-64 bg-white border-r border-[#f2f4f6] flex flex-col hidden lg:flex">
      <div className="p-6 space-y-8 sticky top-[64px]">
        {allGroups.map((group, i) => (
          <div key={i} className="space-y-3">
            <h3 className="text-[12px] font-bold text-[#8b95a1] px-4">{group.title}</h3>
            <div className="flex flex-col gap-1">
              {group.items.map(m => (
                <button 
                  key={m.path} 
                  onClick={() => onNavigate(m.path)}
                  className={`text-left px-4 py-2.5 text-[15px] font-semibold rounded-xl transition-all ${currentPath === m.path ? 'bg-[#e8f3ff] text-[#3182f6]' : 'text-[#4e5968] hover:bg-[#f2f4f6]'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

const Header = ({ role, onLogout }: any) => (
  <header className="bg-white border-b border-[#f2f4f6] px-8 py-4 flex items-center justify-between sticky top-0 z-50 h-[64px]">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[#3182f6] rounded-lg flex items-center justify-center text-white font-black text-sm">C</div>
      <h1 className="text-[19px] font-bold tracking-tight text-[#191f28]">Investment Choi</h1>
      <Badge status={role === 'Ops' ? 'executed' : 'neutral'}>{role}</Badge>
    </div>
    <div className="flex items-center gap-6 text-[15px] font-semibold text-[#4e5968]">
      <span className="cursor-pointer hover:text-[#191f28]">마이페이지</span>
      <button onClick={onLogout} className="cursor-pointer hover:text-[#f04452]">로그아웃</button>
    </div>
  </header>
);

import { News, Portfolio, Orders } from './components/Market';

// --- Main Application ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'User' | 'Ops'>('User');
  const [serverType, setServerType] = useState<0 | 1>(1); // 1: Virtual, 0: Real
  const [currentPath, setCurrentPath] = useState('/');
  const [hasAccount, setHasAccount] = useState(true);
  const [isAutoTradeOn, setIsAutoTradeOn] = useState(false);

  if (!isLoggedIn) {
    return authView === 'login' 
      ? <Login onLogin={(r: any) => { setRole(r); setIsLoggedIn(true); }} onSwitch={() => setAuthView('signup')} />
      : <Signup onBack={() => setAuthView('login')} />;
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/': 
        return <Dashboard serverType={serverType} hasAccount={hasAccount} onNavigate={setCurrentPath} />;
      case '/auto-invest':
        return <AutoInvest />;
      case '/strategies/kr':
        return <Strategy market="kr" />;
      case '/strategies/us':
        return <Strategy market="us" />;
      case '/news':
        return <News />;
      case '/portfolio':
        return <Portfolio />;
      case '/orders':
        return <Orders />;
      case '/batch':
        return <Batch role={role} />;
      case '/backtest':
        return <Backtest />;
      case '/settings':
        return (
          <Settings 
            serverType={serverType} 
            isAutoTradeOn={isAutoTradeOn} 
            onToggleAutoTrade={() => setIsAutoTradeOn(!isAutoTradeOn)} 
          />
        );
      case '/ops/data':
      case '/ops/alerts':
      case '/ops/risk':
      case '/ops/health':
      case '/ops/model':
      case '/ops/audit':
        return <OpsDashboard subPage={currentPath.split('/').pop() || 'data'} />;
      default:
        return (
          <div className="py-20 text-center text-gray-400">
            <p className="text-xl font-bold uppercase">[ {currentPath} ]</p>
            <p className="text-sm mt-2">이 화면은 현재 와이어프레임 제작 중입니다.</p>
          </div>
        );
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#f9fafb] font-sans text-[#191f28] flex flex-col"
      style={{ scrollbarGutter: 'stable' }}
    >
      <Header role={role} onLogout={() => setIsLoggedIn(false)} />
      
      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
        <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} role={role} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-[#f9fafb] border-b border-[#f2f4f6] sticky top-[64px] z-40 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="w-80">
                <SegmentControl 
                  options={[
                    { label: '모의계좌 (VIRTUAL)', value: 1 },
                    { label: '실계좌 (REAL)', value: 0 },
                  ]}
                  activeValue={serverType}
                  onChange={setServerType}
                />
              </div>
              <div className="text-[13px] font-medium text-[#8b95a1] hidden md:block">
                최근 업데이트: 2026-02-04 15:51:20
              </div>
            </div>
          </div>

          <main className="px-8 py-10 flex-1">
            {renderPage()}
          </main>

          <footer className="px-8 py-10 border-t border-[#f2f4f6] text-[13px] text-[#adb5bd] font-medium text-center">
            © 2026 Investment Choi Auto-Trading Pipeline v4.0.0
          </footer>
        </div>
      </div>
    </div>
  );
}
