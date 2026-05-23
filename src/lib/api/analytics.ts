import type { MunicipalityAnalytics } from "../types";
import type { OutbreakAlert } from "../outbreak";
import { apiFetch } from "./client";

export type AnalyticsDashboard = {
  summary: {
    weightedCoveragePercent: number;
    registered: number;
    overdue: number;
    missed: number;
    high: number;
  };
  municipalities: MunicipalityAnalytics[];
  monthlyTrend: { month: string; coverage: number; overdue: number }[];
  ageBucketStats: { bucket: string; coverage: number; children: number }[];
  outbreak: {
    alerts: OutbreakAlert[];
    vaccinePanel: OutbreakAlert[];
    summary: { urgent: number; late: number; watch: number };
  };
  heatmap: {
    municipality: string;
    coveragePercent: number;
    registeredChildren: number;
    overdue: number;
    riskTone: string;
    riskScore: number;
  }[];
  campaigns: {
    id: string;
    title: string;
    municipality: string;
    status: string;
    targetVaccine?: string;
    createdAt: string;
  }[];
  recommendedActions: { municipality: string; action: string }[];
};

export function fetchAnalyticsDashboard(token: string) {
  return apiFetch<AnalyticsDashboard>("/analytics/dashboard", { token });
}

export function fetchOutbreakVaccinePanel(token: string) {
  return apiFetch<{
    vaccines: OutbreakAlert[];
    summary: { urgent: number; late: number; watch: number };
  }>("/analytics/outbreaks/vaccine-panel", { token });
}

export function fetchCampaigns(token: string) {
  return apiFetch<AnalyticsDashboard["campaigns"]>(
    "/analytics/campaigns",
    { token },
  );
}
