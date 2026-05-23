import type { Child } from "@/lib/types";
import { vaccinesFor } from "@/lib/mock-data";
import { scoreFor, type RiskBreakdown } from "@/lib/risk";
import { formatDate } from "@/lib/utils";
import {
  AI_DISCLAIMER,
  MEDICAL_SAFETY_RESPONSE,
  isBlockedMedicalQuery,
  normalizeQueryText,
} from "./safety";
import {
  generateAIRiskInterpretation,
  mapBreakdownToRiskInput,
} from "./risk-ai";
import { generateChildTimelineSummary } from "./timeline-ai";
import { generatePreventiveReminders } from "./reminder-ai";

export type HealthAssistantResponse = {
  summary: string;
  riskScore: number;
  riskLevel: string;
  recommendations: string[];
  nextActions: string[];
  disclaimer: string;
};

function displayRiskLevel(score: number, level: RiskBreakdown["level"]): string {
  if (score <= 30) return "low";
  if (score <= 60) return "medium";
  if (level === "critical") return "high";
  return level;
}

function detectIntent(question: string): string {
  const q = normalizeQueryText(question);
  if (
    /(pse|përse|perse|why).*(rrezik|risk)/i.test(q) ||
    /rrezik.*(mesatar|lart|ulët|ulet|high|medium|low)/i.test(q)
  ) {
    return "risk";
  }
  if (
    /(përmblidh|permbledh|historik|timeline|kronologji)/i.test(q)
  ) {
    return "timeline";
  }
  if (
    /(vaksin|vaccine).*(radh|next|tjetër|tjeter)/i.test(q) ||
    /(cila|which).*(vaksin)/i.test(q)
  ) {
    return "vaccine";
  }
  if (
    /(humbur|missed|harruar|mbetur)/i.test(q) ||
    /(kontroll|checkup).*(humbur|missed)/i.test(q)
  ) {
    return "missed";
  }
  if (
    /(kujtes|reminder|javë|jave|sot|tani|what should|çka duhet|cfare duhet)/i.test(
      q,
    )
  ) {
    return "reminders";
  }
  return "general";
}

function nextVaccineLine(child: Child): string | null {
  const list = vaccinesFor(child.id)
    .filter((v) => v.status === "upcoming" || v.status === "overdue")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
  if (!list[0]) return null;
  const v = list[0];
  const status = v.status === "overdue" ? "me vonesë" : "e ardhshme";
  return `Vaksina ${status}: ${v.name} (afati: ${formatDate(v.dueDate)}).`;
}

export function buildBlockedResponse(): HealthAssistantResponse {
  return {
    summary: MEDICAL_SAFETY_RESPONSE,
    riskScore: 0,
    riskLevel: "low",
    recommendations: [],
    nextActions: [],
    disclaimer: AI_DISCLAIMER,
  };
}

export function buildHealthAssistantResponse(
  child: Child,
  question: string,
): HealthAssistantResponse {
  const breakdown = scoreFor(child);
  const riskScore = breakdown.score;
  const riskLevel = displayRiskLevel(riskScore, breakdown.level);
  const intent = detectIntent(question);

  const riskAi = generateAIRiskInterpretation(
    mapBreakdownToRiskInput(child, breakdown),
  );
  const timeline = generateChildTimelineSummary(child);
  const reminderPack = generatePreventiveReminders(child);

  let summary = riskAi.aiSummary;
  const recommendations: string[] = [];
  const nextActions: string[] = [];

  switch (intent) {
    case "risk":
      summary = `${riskAi.aiSummary} ${riskAi.explanation}`;
      recommendations.push(...riskAi.suggestedActions);
      nextActions.push(...riskAi.suggestedActions);
      break;
    case "timeline":
      summary = timeline.summary;
      recommendations.push(
        ...timeline.completedItems.slice(0, 2),
        ...timeline.upcomingItems.slice(0, 2),
      );
      if (timeline.missedItems.length) {
        recommendations.push(...timeline.missedItems.slice(0, 3));
      }
      nextActions.push(...timeline.nextActions);
      break;
    case "vaccine": {
      const vxLine = nextVaccineLine(child);
      summary = vxLine
        ? `${child.fullName}: ${vxLine}`
        : `${child.fullName}: nuk ka vaksinë të ardhshme të regjistruar.`;
      if (vxLine) recommendations.push(vxLine);
      nextActions.push("Caktoni ose konfirmoni vaksinën në skemën e vaksinimit.");
      break;
    }
    case "missed":
      summary =
        timeline.missedItems.length > 0
          ? `${child.fullName}: ${timeline.missedItems.length} hapa parandalues të humbur ose me vonesë.`
          : `${child.fullName}: nuk ka kontroll parandalues të humbur të regjistruar.`;
      recommendations.push(...timeline.missedItems.slice(0, 5));
      nextActions.push(...timeline.nextActions);
      break;
    case "reminders":
      summary = `Kujtesa parandaluese për ${child.fullName}.`;
      recommendations.push(...reminderPack.reminders);
      nextActions.push(...reminderPack.nextActions);
      break;
    default:
      summary = `${riskAi.aiSummary} ${timeline.summary}`;
      recommendations.push(
        ...reminderPack.reminders.slice(0, 3),
        ...riskAi.suggestedActions.slice(0, 2),
      );
      nextActions.push(
        ...reminderPack.nextActions.slice(0, 2),
        ...riskAi.suggestedActions.slice(0, 2),
      );
  }

  return {
    summary: summary.trim(),
    riskScore,
    riskLevel,
    recommendations: [...new Set(recommendations)].filter(Boolean).slice(0, 8),
    nextActions: [...new Set(nextActions)].filter(Boolean).slice(0, 6),
    disclaimer: AI_DISCLAIMER,
  };
}

export function buildHealthAssistantFromQuestion(
  child: Child | undefined,
  question: string | undefined,
): HealthAssistantResponse {
  if (!child) {
    return {
      summary: "Fëmija nuk u gjet në të dhënat e aplikacionit.",
      riskScore: 0,
      riskLevel: "low",
      recommendations: [],
      nextActions: ["Kthehuni te paneli dhe zgjidhni një fëmijë të regjistruar."],
      disclaimer: AI_DISCLAIMER,
    };
  }

  const q = typeof question === "string" ? question.trim() : "";
  if (!q) {
    return buildHealthAssistantResponse(child, "Çka duhet të bëj tani?");
  }

  if (isBlockedMedicalQuery(q)) {
    return buildBlockedResponse();
  }

  return buildHealthAssistantResponse(child, q);
}
