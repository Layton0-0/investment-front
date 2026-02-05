import { useCallback, useEffect, useState } from "react";
import { getSettingsAccounts, updateSettingsAccounts } from "@/api/settingsApi";
import type { SettingsAccountsUpdateRequestDto } from "@/api/settingsApi";
import type { ServerType } from "@/types";

export interface SettingsMasked {
  appKeyMasked?: string;
  accountNoMasked?: string;
}

export interface UseSettingsAccountsResult {
  masked: SettingsMasked | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  save: (payload: SettingsAccountsUpdateRequestDto) => Promise<void>;
}

export function useSettingsAccounts(serverType: ServerType): UseSettingsAccountsResult {
  const [masked, setMasked] = useState<SettingsMasked | null>(null);
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
        const block = serverType === 1 ? res.virtual : res.real;
        if (!mounted) return;
        setMasked({
          appKeyMasked: block?.appKeyMasked,
          accountNoMasked: block?.accountNoMasked
        });
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
  }, [serverType, trigger]);

  const save = useCallback(
    async (payload: SettingsAccountsUpdateRequestDto) => {
      const res = await updateSettingsAccounts(payload);
      const block = serverType === 1 ? res.virtual : res.real;
      setMasked({
        appKeyMasked: block?.appKeyMasked,
        accountNoMasked: block?.accountNoMasked
      });
    },
    [serverType]
  );

  return { masked, loading, error, refetch, save };
}
