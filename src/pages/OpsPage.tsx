import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { OpsDashboard } from "@/components/Ops";

export function OpsPage() {
  const params = useParams();
  const location = useLocation();
  const subPageFromPath = location.pathname === "/risk" ? "risk" : null;
  const subPage = subPageFromPath ?? params.subPage ?? "data";
  return <OpsDashboard subPage={subPage} />;
}

