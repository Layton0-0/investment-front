import { useCallback, useEffect, useState } from "react";
import {
  getSettingsAccounts,
  updateSettingsAccounts,
  type SettingsAccountsResponseDto,
  type SettingsAccountsUpdateRequestDto,
} from "@/api/settingsApi";

export interface UseSettingsAccountsAllResult {
  data: SettingsAccountsResponseDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  save: (payload: SettingsAccountsUpdateRequestDto) => Promise<void>;
}

/**
 * 계좌 설정 전체(virtual + real) 조회·저장.
 * 설정 페이지에서 모의계좌/실계좌 카드 둘 다 표시할 때 사용.
 */
export function useSettingsAccountsAll(): UseSettingsAccountsAllResult {
  const [data, setData] = useState<SettingsAccountsResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => {
    setTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSettingsAccounts();
        if (!mounted) return;
        setData(res);
      } catch (e: unknown) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "설정 조회에 실패했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [trigger]);

  const save = useCallback(async (payload: SettingsAccountsUpdateRequestDto) => {
    const res = await updateSettingsAccounts(payload);
    setData(res);
  }, []);

  return { data, loading, error, refetch, save };
}
