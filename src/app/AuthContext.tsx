import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { logout as apiLogout } from "../api/authApi";
import { getStoredAccessToken, storeAccessToken } from "../api/http";

export type Role = "User" | "Ops";
export type ServerType = 0 | 1; // 1: Virtual, 0: Real

export interface AuthState {
  isLoggedIn: boolean;
  role: Role;
  serverType: ServerType;
  accessToken: string | null;
  username?: string;
  userId?: string;
}

export interface AuthActions {
  login: (args: { role: Role; accessToken: string; userId?: string; username?: string }) => void;
  logout: () => void;
  setServerType: (serverType: ServerType) => void;
}

const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(getStoredAccessToken());
  const [isLoggedIn, setIsLoggedIn] = useState(!!accessToken);
  const [role, setRole] = useState<Role>("User");
  const [serverType, setServerType] = useState<ServerType>(1);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsLoggedIn(!!accessToken);
    storeAccessToken(accessToken);
  }, [accessToken]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      role,
      serverType,
      accessToken,
      username,
      userId,
      login: (args: { role: Role; accessToken: string; userId?: string; username?: string }) => {
        setRole(args.role);
        setAccessToken(args.accessToken);
        setUserId(args.userId);
        setUsername(args.username);
      },
      logout: () => {
        // best-effort: notify backend, but do not block UI logout
        apiLogout().catch(() => {});

        setAccessToken(null);
        setRole("User");
        setServerType(1);
        setUserId(undefined);
        setUsername(undefined);
      },
      setServerType
    }),
    [isLoggedIn, role, serverType, accessToken, username, userId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

