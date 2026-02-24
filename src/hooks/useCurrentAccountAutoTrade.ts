import { useEffect, useState } from "react";
import { getMainAccount } from "@/api/userAccountsApi";
import { getSettingByAccountNo } from "@/api/settingsApi";
import type { ServerType } from "@/types";

export interface UseCurrentAccountAutoTradeResult {
  /** 현재 선택된 계좌(모의/실)의 자동매매 ON 여부 */
  isAutoTradeOn: boolean;
  loading: boolean;
}

/**
 * 상단 토글(모의계좌/실계좌)에 해당하는 메인 계좌의 자동매매 설정을 조회한다.
 * 킬스위치 카드 노출 조건(isAdmin && isAutoTradeOn) 등에 사용.
 */
export function useCurrentAccountAutoTrade(
  serverTypeNumeric: ServerType
): UseCurrentAccountAutoTradeResult {
  const [isAutoTradeOn, setIsAutoTradeOn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const serverTypeParam = serverTypeNumeric === 1 ? "1" : "0";
    getMainAccount(serverTypeParam)
      .then((main) => {
        if (!mounted) return;
        if (!main?.accountNo) {
          setIsAutoTradeOn(false);
          setLoading(false);
          return;
        }
        return getSettingByAccountNo(main.accountNo).then((setting) => {
          if (!mounted) return;
          setIsAutoTradeOn(!!setting?.autoTradingEnabled);
          setLoading(false);
        });
      })
      .catch(() => {
        if (mounted) {
          setIsAutoTradeOn(false);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [serverTypeNumeric]);

  return { isAutoTradeOn, loading };
}
