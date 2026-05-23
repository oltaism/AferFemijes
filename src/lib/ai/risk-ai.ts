import type { Child } from "@/lib/types";
import type { RiskBreakdown } from "@/lib/risk";
import { AI_DISCLAIMER } from "./safety";

export type AIRiskInput = {
  child: Child;
  riskScore: number;
  riskLevel: string;
  riskReasons: string[];
};

export type AIRiskOutput = {
  aiSummary: string;
  explanation: string;
  suggestedActions: string[];
  disclaimer: string;
};

function preventiveBand(score: number): "low" | "medium" | "high" {
  if (score <= 30) return "low";
  if (score <= 60) return "medium";
  return "high";
}

function bandLabelSq(band: "low" | "medium" | "high"): string {
  switch (band) {
    case "low":
      return "i ulët parandalues";
    case "medium":
      return "mesatar parandalues";
    case "high":
      return "i lartë parandalues";
  }
}

function buildActionsFromReasons(reasons: string[]): string[] {
  const actions: string[] = [];
  const joined = reasons.join(" ").toLowerCase();

  if (joined.includes("vaksin") && joined.includes("vones")) {
    actions.push(
      "Kontrolloni kalendarin e vaksinave dhe caktoni ose konfirmoni vaksinën e humbur.",
    );
  } else if (joined.includes("vaksin")) {
    actions.push("Shikoni datën e vaksinës së radhës në skemën e vaksinimit.");
  }

  if (joined.includes("kontroll") && joined.includes("humbur")) {
    actions.push(
      "Planifikoni një vizitë parandaluese rutinore me pediatrin tuaj.",
    );
  }

  if (joined.includes("rritje")) {
    actions.push("Përditësoni matjet e rritjes në profilin e fëmijës.");
  }

  if (joined.includes("kujtes")) {
    actions.push("Rishikoni kujtesat aktive dhe shënoni çfarë është kryer.");
  }

  if (joined.includes("profil")) {
    actions.push(
      "Plotësoni kontaktin e emergjencës dhe të dhënat bazë në profil.",
    );
  }

  if (joined.includes("etap")) {
    actions.push(
      "Diskutoni me mjekun e fëmijës hapat e zhvillimit në kontrollin e radhës.",
    );
  }

  if (actions.length === 0) {
    actions.push(
      "Vazhdoni me kujtesat dhe kontrollet e planifikuara sipas kalendarit parandalues.",
    );
  }

  return actions.slice(0, 4);
}

export function generateAIRiskInterpretation(input: AIRiskInput): AIRiskOutput {
  const score = Math.min(100, Math.max(0, input.riskScore ?? 0));
  const band = preventiveBand(score);
  const label = bandLabelSq(band);
  const name = input.child?.fullName ?? "Fëmija";
  const reasons = input.riskReasons.filter(Boolean);

  const aiSummary = `${name} ka një nivel ${label} (${score}/100) bazuar në kujdesin parandalues të regjistruar në aplikacion.`;

  let explanation: string;
  if (reasons.length === 0) {
    explanation =
      "Nuk ka arsye të regjistruara për vonesë parandaluese. Kjo zakonisht tregon që kujdesi rutinor është në rregull sipas të dhënave aktuale.";
  } else if (band === "low") {
    explanation = `Rreziku parandalues është i ulët. Arsyet e regjistruara: ${reasons.join("; ")}.`;
  } else if (band === "medium") {
    explanation = `Rreziku parandalues është mesatar sepse ka disa hapa parandalues që duhen rishikuar: ${reasons.join("; ")}.`;
  } else {
    explanation = `Rreziku parandalues është i lartë sepse mungojnë ose vonohen hapa të rëndësishëm parandalues: ${reasons.join("; ")}.`;
  }

  return {
    aiSummary,
    explanation,
    suggestedActions: buildActionsFromReasons(reasons),
    disclaimer: AI_DISCLAIMER,
  };
}

export function mapBreakdownToRiskInput(
  child: Child,
  breakdown: RiskBreakdown,
): AIRiskInput {
  return {
    child,
    riskScore: breakdown.score,
    riskLevel: breakdown.level,
    riskReasons: breakdown.reasons.map((r) => r.label),
  };
}
