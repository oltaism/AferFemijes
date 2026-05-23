import type { Child, Reminder, RiskAlert } from "../types";
import type { RiskBreakdown } from "../risk";
import { apiFetch } from "./client";

export type ParentDashboardResponse = {
  children: (Child & {
    risk: RiskBreakdown;
    alertCount: number;
  })[];
  reminders: Reminder[];
  focusChild: {
    child: Child;
    breakdown: RiskBreakdown;
    alerts: RiskAlert[];
  } | null;
};

export function fetchParentDashboard(token: string) {
  return apiFetch<ParentDashboardResponse>("/parent/dashboard", { token });
}
