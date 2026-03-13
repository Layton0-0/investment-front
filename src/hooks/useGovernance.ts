import { useCallback, useEffect, useState } from "react";
import {
  getGovernanceResults,
  getGovernanceHalts,
  getGovernanceStatus,
  type GovernanceCheckResultDto,
  type GovernanceHaltDto,
} from "@/api/opsApi";

const DEFAULT_RESULTS_LIMIT = 20;

export interface UseGovernanceResult {
  results: GovernanceCheckResultDto[];
  halts: GovernanceHaltDto[];
  governanceEnabled: boolean | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Governance results (last N), active halts, and status.
 * Single responsibility: fetch only; loading/error/empty handled by caller.
 */
export function useGovernance(limit: number = DEFAULT_RESULTS_LIMIT): UseGovernanceResult {
  const [results, setResults] = useState<GovernanceCheckResultDto[]>([]);
  const [halts, setHalts] = useState<GovernanceHaltDto[]>([]);
  const [governanceEnabled, setGovernanceEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getGovernanceResults({ limit }),
      getGovernanceHalts(),
      getGovernanceStatus(),
    ])
      .then(([r, h, status]) => {
        setResults(r ?? []);
        setHalts(h ?? []);
        setGovernanceEnabled(status?.governanceEnabled ?? null);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "전략 거버넌스 조회에 실패했습니다.");
      })
      .finally(() => setLoading(false));
  }, [limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    results,
    halts,
    governanceEnabled,
    loading,
    error,
    refetch,
  };
}
