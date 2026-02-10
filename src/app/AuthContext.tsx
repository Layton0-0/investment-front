import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getMyPage, logout as apiLogout } from "@/api/authApi";
import { setUnauthorizedHandler } from "@/api/http";

export type Role = "User" | "Admin";
export type ServerType = 0 | 1; // 1: Virtual, 0: Real

export interface AuthState {
  isLoggedIn: boolean;
  role: Role;
  serverType: ServerType;
  username?: string;
  userId?: string;
}

export interface AuthActions {
  login: (args: { role: Role; userId?: string; username?: string }) => void;
  logout: () => void;
  setServerType: (serverType: ServerType) => void;
}

const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

function getLoginRedirectUrl(): string {
  const base = import.meta.env?.VITE_BASE_URL ?? "";
  return `${base}/login`.replace(/\/+/g, "/");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>("User");
  const [serverType, setServerType] = useState<ServerType>(1);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const logout = useCallback(() => {
    apiLogout().catch(() => {});
    setIsLoggedIn(false);
    setRole("User");
    setServerType(1);
    setUserId(undefined);
    setUsername(undefined);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      window.location.href = getLoginRedirectUrl();
    });
    return () => setUnauthorizedHandler(undefined);
  }, [logout]);

  useEffect(() => {
    getMyPage({ skipUnauthorizedHandler: true })
      .then((res) => {
        setUserId(res.userId);
        setUsername(res.username);
        setRole(res.role === "Admin" ? "Admin" : "User");
        setIsLoggedIn(true);
      })
      .catch(() => {
        setIsLoggedIn(false);
      })
      .finally(() => {
        setInitialCheckDone(true);
      });
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      role,
      serverType,
      username,
      userId,
      login: (args: { role: Role; userId?: string; username?: string }) => {
        setRole(args.role);
        setUserId(args.userId);
        setUsername(args.username);
        setIsLoggedIn(true);
      },
      logout,
      setServerType
    }),
    [isLoggedIn, role, serverType, username, userId, logout]
  );

  if (!initialCheckDone) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
