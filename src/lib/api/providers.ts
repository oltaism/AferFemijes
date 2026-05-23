import type { Appointment, Child, Vaccine } from "../types";
import type { RiskBreakdown } from "../risk";
import { apiFetch } from "./client";

export type ProviderDashboardResponse = {
  summary: {
    assignedChildren: number;
    highRiskCount: number;
    todayAppointments: number;
    unconfirmedVaccines: number;
    unreadMessages: number;
  };
  highRisk: {
    child: Child;
    risk: RiskBreakdown;
    alerts: { id: string; title: string; priority: string }[];
  }[];
  todayAppointments: (Appointment & { childName?: string })[];
  unconfirmedVaccines: Vaccine[];
};

export function fetchProviderDashboard(token: string) {
  return apiFetch<ProviderDashboardResponse>("/providers/dashboard", { token });
}

export function confirmVaccine(token: string, vaccineId: string) {
  return apiFetch<Vaccine>(`/providers/vaccines/${vaccineId}/confirm`, {
    method: "PATCH",
    token,
  });
}
