import React from "react";
import { TrendingUp, Globe, Newspaper, PieChart, Zap, Settings } from "lucide-react";
import { DASHBOARD_QUICK_NAV_LABELS, DASHBOARD_QUICK_NAV_PATH, ROUTES } from "@/constants/routes";

const QUICK_NAV_ICONS = [
  TrendingUp,
  Globe,
  Newspaper,
  PieChart,
  Zap,
  Settings
] as const;

export interface DashboardSummaryCardsProps {
  onNavigate: (path: string) => void;
}

export function DashboardSummaryCards({ onNavigate }: DashboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {DASHBOARD_QUICK_NAV_LABELS.map((item, idx) => {
        const Icon = QUICK_NAV_ICONS[idx];
        return (
          <button
            key={item}
            type="button"
            onClick={() => onNavigate(DASHBOARD_QUICK_NAV_PATH[item] ?? ROUTES.DASHBOARD)}
            className="p-6 bg-card rounded-2xl shadow-card hover:shadow-lg transition-all text-left flex flex-col justify-between h-32 group border border-border hover:border-primary/20"
          >
            {Icon && (
              <Icon className="w-6 h-6 text-accent opacity-50 group-hover:opacity-100 transition-opacity" />
            )}
            <span className="text-base font-bold text-foreground">{item}</span>
          </button>
        );
      })}
    </div>
  );
}
