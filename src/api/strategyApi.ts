import { apiFetch } from "./http";

export interface StrategyDto {
  accountNo: string;
  market?: string; // "KR" | "US"
  strategyType: string; // enum name
  enabled?: boolean;
  status?: string;
  name?: string;
  description?: string;
}

export function getStrategies(accountNo: string, market?: "KR" | "US") {
  const qs = market ? `?market=${encodeURIComponent(market)}` : "";
  return apiFetch<StrategyDto[]>(
    `/api/v1/strategies/${encodeURIComponent(accountNo)}${qs}`,
    { method: "GET" }
  );
}

export function activateStrategy(accountNo: string, strategyType: string, market?: "KR" | "US") {
  const qs = market ? `?market=${encodeURIComponent(market)}` : "";
  return apiFetch<StrategyDto>(
    `/api/v1/strategies/${encodeURIComponent(accountNo)}/${encodeURIComponent(strategyType)}/activate${qs}`,
    { method: "POST" }
  );
}

export function stopStrategy(accountNo: string, strategyType: string, market?: "KR" | "US") {
  const qs = market ? `?market=${encodeURIComponent(market)}` : "";
  return apiFetch<StrategyDto>(
    `/api/v1/strategies/${encodeURIComponent(accountNo)}/${encodeURIComponent(strategyType)}/stop${qs}`,
    { method: "POST" }
  );
}

