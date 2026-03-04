import { apiFetch } from "./http";

export interface KillSwitchStatusDto {
  haltAllOrders: boolean;
}

/** Kill Switch 상태 조회. GET /api/v1/system/kill-switch */
export function getKillSwitch(): Promise<KillSwitchStatusDto> {
  return apiFetch<KillSwitchStatusDto>("/api/v1/system/kill-switch", { method: "GET" });
}

/** Kill Switch 설정. PUT /api/v1/system/kill-switch (ADMIN 전용) */
export function putKillSwitch(body: { haltAllOrders: boolean }): Promise<KillSwitchStatusDto> {
  return apiFetch<KillSwitchStatusDto>("/api/v1/system/kill-switch", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
