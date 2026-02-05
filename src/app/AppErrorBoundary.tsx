import React, { Component, type ErrorInfo, type ReactNode } from "react";

const FALLBACK_MESSAGE = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
const isDev = import.meta.env?.DEV === true;

export interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render errors in the tree and shows a generic message.
 * Does not expose stack traces or internal details to the user.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (isDev) {
      console.error("[AppErrorBoundary]", error, errorInfo.componentStack);
    }
    // In production, send to error reporting service instead of console
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-8"
          style={{
            backgroundColor: "var(--color-background-page, #f9fafb)",
            color: "var(--color-text, #191f28)"
          }}
          role="alert"
        >
          <h1 className="text-xl font-bold mb-2">{FALLBACK_MESSAGE}</h1>
          {isDev && (
            <p className="text-sm mt-4 text-gray-500">
              개발 모드: 콘솔에서 상세 오류를 확인할 수 있습니다.
            </p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
