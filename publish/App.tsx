import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { AutoInvest, Strategy } from './components/Investment';
import { Settings, Backtest } from './components/System';
import { OpsDashboard, Batch } from './components/Ops';
import { Button, Card, Input, SegmentControl, Badge } from './components/UI';

const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#3182F6"/>
    <path d="M10 25L18 17L24 23L32 12" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="32" cy="12" r="3" fill="#00D47E" stroke="#3182F6" strokeWidth="2"/>
  </svg>
);

// --- Auth Components ---
const Login = ({ onLogin, onSwitch }: any) => (
  <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4">
    <Card className="w-full max-w-sm shadow-xl border-none" title="">
      <div className="flex flex-col items-center mb-8">
        <Logo className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-black text-[#191f28]">Investment Choi</h2>
        <p className="text-[#8b95a1] font-medium mt-1">자동 투자의 새로운 기준</p>
      </div>
      <div className="space-y-4">
        <Input label="아이디" placeholder="admin / user" />
        <Input label="비밀번호" type="password" placeholder="••••••••" />
        <Button className="w-full h-14" onClick={() => onLogin('User')}>로그인</Button>
        <div className="text-center text-[14px] text-[#8b95a1] font-semibold pt-6 border-t border-[#f2f4f6]">
          계정이 없으신가요? <button onClick={onSwitch} className="text-[#3182f6] hover:underline">회원가입</button>
        </div>
      </div>
    </Card>
  </div>
);

const Signup = ({ onBack }: any) => (
  <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4 py-12">
    <Card className="w-full max-w-md shadow-xl border-none">
      <div className="flex flex-col items-center mb-8">
        <Logo className="w-12 h-12 mb-3" />
        <h2 className="text-xl font-bold text-[#191f28]">회원가입</h2>
      </div>
      <div className="space-y-5">
        <Input label="이름" placeholder="홍길동" />
        <Input label="이메일" placeholder="choi@example.com" />
        <Input label="비밀번호" type="password" placeholder="••••••••" />
        
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-[#4e5968]">주거래 은행</label>
          <select className="bg-[#f2f4f6] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3182f6]/20 appearance-none">
            <option>토스뱅크</option>
            <option>신한은행</option>
            <option>국민은행</option>
            <option>카카오뱅크</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-xl">
          <div>
            <div className="text-[14px] font-bold text-[#191f28]">마케팅 정보 수신 동의</div>
            <div className="text-[12px] text-[#8b95a1]">이벤트 및 혜택 정보를 보내드립니다.</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-[#d1d6db] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3182f6]"></div>
          </label>
        </div>

        <Button className="w-full h-14 mt-4">가입하기</Button>
        <button onClick={onBack} className="w-full text-[14px] text-[#8b95a1] font-bold hover:text-[#4e5968]">뒤로가기</button>
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

const Header = ({ role, onLogout, onLogoClick }: any) => (
  <header className="bg-white border-b border-[#f2f4f6] px-8 py-4 flex items-center justify-between sticky top-0 z-50 h-[64px]">
    <div className="flex items-center gap-3 cursor-pointer group" onClick={onLogoClick}>
      <Logo className="w-8 h-8 group-hover:scale-110 transition-transform" />
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
    const handleLogin = (userRole: any) => {
      // In a real app, check permissions from API. 
      // For wireframe, "admin" triggers Ops, others User.
      setRole(userRole === 'Ops' ? 'Ops' : 'User');
      setIsLoggedIn(true);
    };

    return authView === 'login' 
      ? <Login onLogin={(r: any) => handleLogin(r === 'User' && window.confirm('운영자 권한으로 로그인하시겠습니까?') ? 'Ops' : 'User')} onSwitch={() => setAuthView('signup')} />
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

  const showSegmentControl = !['/', '/ops/data', '/ops/alerts', '/ops/risk', '/ops/health', '/ops/model', '/ops/audit'].includes(currentPath);

  return (
    <div 
      className="min-h-screen bg-[#f9fafb] font-sans text-[#191f28] flex flex-col"
      style={{ scrollbarGutter: 'stable' }}
    >
      <Header role={role} onLogout={() => setIsLoggedIn(false)} onLogoClick={() => setCurrentPath('/')} />
      
      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
        <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} role={role} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {showSegmentControl && (
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
          )}

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
