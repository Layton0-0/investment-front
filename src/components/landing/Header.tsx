import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-bold text-foreground">Investment Choi</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              서비스 소개
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              투자 전략
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              수수료
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              고객 지원
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">로그인</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/signup">시작하기</Link>
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link to="/" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                서비스 소개
              </Link>
              <Link to="/" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                투자 전략
              </Link>
              <Link to="/" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                수수료
              </Link>
              <Link to="/" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                고객 지원
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" asChild>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>로그인</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>시작하기</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
