import type {
  Appointment,
  Child,
  ChildDocument,
  Consent,
  GrowthRecord,
  Message,
  Milestone,
  Reminder,
  RiskAlert,
  Vaccine,
} from "../types";
import type { RiskBreakdown } from "../risk";
import type { RiskForecast } from "../predictive";
import { apiFetch } from "./client";

export type ChildProfileResponse = {
  child: Child;
  vaccines: Vaccine[];
  appointments: Appointment[];
  reminders: Reminder[];
  growth: GrowthRecord[];
  milestones: Milestone[];
  documents: ChildDocument[];
  consents: Consent[];
  riskAlerts: RiskAlert[];
  risk: RiskBreakdown;
  forecast: RiskForecast;
};

export function fetchChildren(token: string) {
  return apiFetch<(Child & { risk: RiskBreakdown; alertCount: number })[]>(
    "/children",
    { token },
  );
}

export function fetchChildProfile(token: string, id: string) {
  return apiFetch<ChildProfileResponse>(`/children/${id}`, { token });
}

export function createChild(
  token: string,
  body: {
    fullName: string;
    dateOfBirth: string;
    gender?: "F" | "M" | "O";
    municipality?: string;
    healthCenter?: string;
    allergies?: string[];
    chronicConditions?: string[];
    emergencyContact?: { name: string; phone: string; relation: string };
  },
) {
  return apiFetch<Child>("/children", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}
