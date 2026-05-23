import { Child } from "./types";
import { vaccinesFor, appointmentsFor, milestonesFor } from "./mock-data";
import { scoreFor } from "./risk";

/**
 * National-average benchmarks (mock). These are illustrative figures used
 * for the comparative health insight panel: "Your child vs national avg".
 */
export const NATIONAL_BENCHMARKS = {
  vaccinationTimelinessPercent: 86, // % vaccines given within recommended window
  missedCheckupsPerYear: 1.4,
  preventiveCareScore: 18, // average risk score nationally (lower = better)
  overdueAlertsPerChild: 1.1,
  growthRecordsPerYear: 3.2,
};

export type BenchmarkRow = {
  metric: string;
  child: number;
  national: number;
  /** "higher is better" or "lower is better" */
  direction: "higher" | "lower";
  unit?: string;
  detail: string;
};

export function benchmarksFor(child: Child): BenchmarkRow[] {
  const vx = vaccinesFor(child.id);
  const total = vx.length;
  const onTime = vx.filter(
    (v) => v.status === "completed" && v.providerConfirmed,
  ).length;
  const timeliness = total > 0 ? Math.round((onTime / total) * 100) : 100;

  const checkups = appointmentsFor(child.id).filter(
    (a) => a.service === "routine-checkup",
  );
  const missed = checkups.filter((a) => a.status === "missed").length;

  const overdue = vx.filter(
    (v) => v.status === "overdue" || v.status === "catch-up",
  ).length;

  const ms = milestonesFor(child.id);
  const flaggedMilestones = ms.filter(
    (m) => m.status === "delayed" || m.status === "review",
  ).length;

  const score = scoreFor(child).score;

  return [
    {
      metric: "Përpikëria e vaksinimit",
      child: timeliness,
      national: NATIONAL_BENCHMARKS.vaccinationTimelinessPercent,
      direction: "higher",
      unit: "%",
      detail:
        timeliness >= NATIONAL_BENCHMARKS.vaccinationTimelinessPercent
          ? "Mbi mesataren."
          : "Nën mesataren — vepro.",
    },
    {
      metric: "Kontrolle rutinore të humbura",
      child: missed,
      national: NATIONAL_BENCHMARKS.missedCheckupsPerYear,
      direction: "lower",
      detail:
        missed <= NATIONAL_BENCHMARKS.missedCheckupsPerYear
          ? "Më pak se mesatarja."
          : "Më shumë se mesatarja.",
    },
    {
      metric: "Pikët e rrezikut parandalues",
      child: score,
      national: NATIONAL_BENCHMARKS.preventiveCareScore,
      direction: "lower",
      unit: "/100",
      detail:
        score <= NATIONAL_BENCHMARKS.preventiveCareScore
          ? "Rrezik më i ulët."
          : "Rrezik më i lartë.",
    },
    {
      metric: "Vaksina të vonuara / rikthim në normë",
      child: overdue,
      national: NATIONAL_BENCHMARKS.overdueAlertsPerChild,
      direction: "lower",
      detail:
        overdue <= NATIONAL_BENCHMARKS.overdueAlertsPerChild
          ? "Në normë."
          : "Mbi normën — rikthim në normë.",
    },
    {
      metric: "Etapa në shqyrtim",
      child: flaggedMilestones,
      national: 0.6,
      direction: "lower",
      detail:
        flaggedMilestones <= 0.6
          ? "Në normë."
          : "Mbi normën — flit me mjekun.",
    },
  ];
}

/** Aggregate score 0–100 reflecting how the child compares to the nation. */
export function preventiveHealthIndex(child: Child): number {
  const score = scoreFor(child).score;
  // Inverted preventive-risk → wellness index (higher = better)
  const idx = Math.max(0, Math.min(100, Math.round(100 - score)));
  return idx;
}
