import React from "react";
import { AuthProvider } from "@/app/AuthContext";
import { AppRoutes } from "@/app/AppRoutes";
import { AppErrorBoundary } from "@/app/AppErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  return (
    <AppErrorBoundary>
      <TooltipProvider delayDuration={0}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </AppErrorBoundary>
  );
}

