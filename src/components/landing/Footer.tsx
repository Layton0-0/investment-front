import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Logo className="w-10 h-10 text-primary-foreground" />
              <span className="text-xl font-bold">Pulsarve</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              AI 기반 로보어드바이저로
              스마트한 자산관리를 시작하세요.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link to="/login" className="hover:text-primary-foreground transition-colors">로보어드바이저</Link></li>
              <li><Link to="/login" className="hover:text-primary-foreground transition-colors">포트폴리오 분석</Link></li>
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">수수료</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">회사</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">서비스 소개</Link></li>
              <li><Link to="/login" className="hover:text-primary-foreground transition-colors">로그인</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">법적 고지</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">이용약관</Link></li>
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">개인정보처리방침</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60">
              © 2026 Pulsarve. All rights reserved.
            </p>
          </div>
          <p className="text-xs text-primary-foreground/40 mt-4 text-center md:text-left">
            투자에는 원금 손실의 위험이 있으며, 과거의 수익률이 미래의 수익을 보장하지 않습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
