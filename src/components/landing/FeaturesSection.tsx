import React from "react";
import { motion } from "framer-motion";
import { Brain, LineChart, Shield, Globe, RefreshCcw, PieChart } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI 기반 분석",
    description: "머신러닝 알고리즘이 시장 데이터를 분석하여 최적의 투자 결정을 내립니다.",
  },
  {
    icon: Globe,
    title: "글로벌 분산 투자",
    description: "한국과 미국 시장에 분산 투자하여 리스크를 최소화하고 수익을 극대화합니다.",
  },
  {
    icon: RefreshCcw,
    title: "자동 리밸런싱",
    description: "시장 상황에 맞춰 포트폴리오를 자동으로 조정하여 목표 수익률을 유지합니다.",
  },
  {
    icon: PieChart,
    title: "맞춤형 포트폴리오",
    description: "투자 성향과 목표에 맞는 개인화된 포트폴리오를 구성해 드립니다.",
  },
  {
    icon: Shield,
    title: "강화된 보안",
    description: "금융보안원 인증 보안 시스템으로 안전하게 자산을 관리합니다.",
  },
  {
    icon: LineChart,
    title: "실시간 대시보드",
    description: "투자 현황을 실시간으로 확인하고 성과를 한눈에 파악할 수 있습니다.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
          >
            왜 Pulsarve를 선택해야 할까요?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            전문 투자자만 누릴 수 있던 체계적인 자산관리를
            AI 기술로 누구나 이용할 수 있습니다.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
