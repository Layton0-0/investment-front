import React from "react";
import { useParams } from "react-router-dom";
import { OpsDashboard } from "../../components/Ops";

export function OpsPage() {
  const params = useParams();
  const subPage = params.subPage || "data";
  return <OpsDashboard subPage={subPage} />;
}

