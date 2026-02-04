import { apiFetch } from "./http";

export interface TriggerResponse {
  success: boolean;
  message: string;
  [k: string]: any;
}

export function trigger(path: string) {
  return apiFetch<TriggerResponse>(`/api/v1/trigger/${path}`, { method: "POST" });
}

