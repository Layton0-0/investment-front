import React from "react";
import { useLocation } from "react-router-dom";
import { OpsDashboard } from "@/components/Ops";

export function OpsPage() {
  const location = useLocation();
  const subPage =
    location.pathname === "/risk"
      ? "risk"
      : location.pathname.startsWith("/ops/")
        ? (location.pathname.replace("/ops/", "") as "data" | "alerts" | "model" | "audit" | "health" | "governance" | "settings")
        : "data";
  return <OpsDashboard subPage={subPage} />;
}

