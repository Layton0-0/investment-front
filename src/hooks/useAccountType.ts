import { useCallback, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/AuthContext";

export type AccountType = "mock" | "real";

/**
 * URL serverType query와 AuthContext serverType을 동기화하는 훅.
 * 탭 변경 시 URL 쿼리와 auth.setServerType을 함께 갱신하고,
 * URL 변경(뒤로가기 등) 시 auth를 URL에 맞춘다.
 */
export function useAccountType() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const serverTypeParam = searchParams.get("serverType");
  const numericType: 0 | 1 = serverTypeParam === "0" ? 0 : 1;
  const serverType: AccountType = numericType === 0 ? "real" : "mock";

  const setServerType = useCallback(
    (type: AccountType) => {
      const value = type === "real" ? 0 : 1;
      auth.setServerType(value);
      const next = new URLSearchParams(searchParams);
      next.set("serverType", String(value));
      navigate({ pathname: location.pathname, search: next.toString() }, { replace: true });
    },
    [auth, searchParams, navigate, location.pathname]
  );

  useEffect(() => {
    if (serverTypeParam === "0" || serverTypeParam === "1") {
      const v = Number(serverTypeParam) as 0 | 1;
      if (v !== auth.serverType) {
        auth.setServerType(v);
      }
    }
  }, [serverTypeParam, auth.serverType, auth.setServerType]);

  return {
    serverType,
    serverTypeNumeric: numericType,
    setServerType,
    isMock: serverType === "mock",
    isReal: serverType === "real",
  };
}
