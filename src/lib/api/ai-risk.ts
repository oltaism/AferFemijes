import type { Child, RiskAlert } from "../types";
import type { RiskBreakdown } from "../risk";
import type { RiskForecast } from "../predictive";
import { apiFetch } from "./client";

export type AiPortfolioItem = {
  childId: string;
  fullName: string;
  risk: RiskBreakdown;
  alertCount: number;
};

export function fetchAiPortfolio(token: string) {
  return apiFetch<AiPortfolioItem[]>("/ai-risk/portfolio", { token });
}

export function fetchAiForecast(token: string, childId: string) {
  return apiFetch<{ forecast: RiskForecast }>(
    `/ai-risk/children/${childId}/forecast`,
    { token },
  );
}

export function fetchAiAlerts(token: string, childId: string) {
  return apiFetch<RiskAlert[]>(`/ai-risk/children/${childId}/alerts`, {
    token,
  });
}

export function fetchAiScore(token: string, childId: string) {
  return apiFetch<{ breakdown: RiskBreakdown }>(
    `/ai-risk/children/${childId}/score`,
    { token },
  );
}

export type AiChildBundle = {
  child: Child;
  breakdown: RiskBreakdown;
  alerts: RiskAlert[];
  forecast: RiskForecast;
};
