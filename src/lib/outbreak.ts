import {
  children as allChildren,
  municipalityAnalytics,
  vaccines as allVaccines,
} from "./mock-data";
import { Municipality } from "./types";

/**
 * Public health outbreak intelligence (mock).
 *
 * Detects clusters of low coverage by region + vaccine + age group, and
 * surfaces them as actionable outbreak-risk alerts.
 *
 * IMPORTANT: this is informational planning intelligence — the actual
 * declaration of an outbreak is the job of public health authorities and
 * official disease surveillance systems.
 */

export type OutbreakSeverity = "watch" | "elevated" | "high" | "urgent";

export type OutbreakAlert = {
  id: string;
  municipality: Municipality;
  disease: string;
  vaccine: string;
  coveragePercent: number;
  targetPercent: number;
  childrenAtRisk: number;
  daysToAct: number;
  severity: OutbreakSeverity;
  headline: string;
  detail: string;
  recommendedAction: string;
};

/** Albanian display names for municipalities. */
export const municipalityLabel: Record<Municipality, string> = {
  Prishtina: "Prishtinë",
  Prizren: "Prizren",
  Peja: "Pejë",
  Mitrovica: "Mitrovicë",
  Gjilan: "Gjilan",
  Ferizaj: "Ferizaj",
};

function severityFor(coverage: number, atRisk: number): OutbreakSeverity {
  if (coverage < 65 && atRisk >= 25) return "urgent";
  if (coverage < 70) return "high";
  if (coverage < 80) return "elevated";
  return "watch";
}

/** Disease ↔ vaccine map for the demo. */
const DISEASE_VACCINE_PAIRS: {
  disease: string;
  vaccine: string;
  threshold: number;
}[] = [
  { disease: "Fruthi", vaccine: "MMR", threshold: 95 },
  { disease: "Difteri · Tetanus · Pertusis", vaccine: "DTaP", threshold: 95 },
  { disease: "Poliomieliti", vaccine: "IPV", threshold: 95 },
  { disease: "Hepatiti B", vaccine: "Hepatitis B", threshold: 95 },
];

const VACCINE_OFFSET: Record<string, number> = {
  MMR: -6,
  DTaP: -2,
  IPV: 0,
  "Hepatitis B": 1,
};

function daysToActFor(sev: OutbreakSeverity): number {
  if (sev === "urgent") return 14;
  if (sev === "high") return 30;
  if (sev === "elevated") return 45;
  return 60;
}

export function detectOutbreaks(): OutbreakAlert[] {
  const out: OutbreakAlert[] = [];

  for (const m of municipalityAnalytics) {
    // children in this municipality (mock dataset is small, so use the
    // municipality-level coverage figure as the per-vaccine proxy)
    const childrenHere = allChildren.filter((c) => c.municipality === m.municipality);

    for (const pair of DISEASE_VACCINE_PAIRS) {
      // For demo: assume per-vaccine coverage equals municipality coverage
      // shifted by a small per-vaccine offset so different vaccines look
      // realistic.
      const offset = VACCINE_OFFSET[pair.vaccine] ?? 0;
      const coverage = Math.max(40, Math.min(99, m.coveragePercent + offset));
      if (coverage >= pair.threshold) continue;

      const atRiskShare = Math.round(
        m.registeredChildren * ((pair.threshold - coverage) / 100),
      );
      const sev = severityFor(coverage, atRiskShare);

      out.push({
        id: `out-${m.municipality}-${pair.vaccine}`,
        municipality: m.municipality,
        disease: pair.disease,
        vaccine: pair.vaccine,
        coveragePercent: coverage,
        targetPercent: pair.threshold,
        childrenAtRisk: atRiskShare,
        daysToAct: daysToActFor(sev),
        severity: sev,
        headline:
          sev === "urgent"
            ? `Rrezik shpërthimi i ${pair.disease} — ${m.municipality}`
            : `Mbulim i ulët i ${pair.vaccine} në ${m.municipality}`,
        detail:
          `Mbulimi me ${pair.vaccine} në ${coverage}% (objektivi ≥${pair.threshold}%). ` +
          `~${atRiskShare} fëmijë në ${m.municipality} potencialisht të pambrojtur ndaj ${pair.disease}.` +
          (childrenHere.length > 0
            ? ` ${childrenHere.length} fëmijë në të dhënat lokale.`
            : ""),
        recommendedAction:
          sev === "urgent"
            ? `Lansoni menjëherë fushatë rikthimi në normë për ${pair.vaccine} dhe aktivizoni infermierët në ${m.municipality}.`
            : sev === "high"
              ? `Planifiko fushatë për ${pair.vaccine} brenda 30 ditëve për ${m.municipality}.`
              : sev === "elevated"
                ? `Dërgo kujtesa për ${pair.vaccine} te prindërit në ${m.municipality}.`
                : `Vazhdo monitorimin e mbulimit me ${pair.vaccine} në ${m.municipality}.`,
      });
    }
  }

  return out.sort((a, b) => severityOrder(b.severity) - severityOrder(a.severity));
}

/** Worst coverage per vaccine — për panelin 2×2 (si mockup-i). */
export function topOutbreakRisks(limit = 4): OutbreakAlert[] {
  const all = detectOutbreaks();
  const focusMunicipality =
    municipalityAnalytics
      .slice()
      .sort((a, b) => a.coveragePercent - b.coveragePercent)[0]?.municipality ??
    "Mitrovica";

  const focus = all.filter((o) => o.municipality === focusMunicipality);
  const pool = focus.length >= limit ? focus : all;

  const byVaccine = new Map<string, OutbreakAlert>();
  for (const o of pool) {
    const existing = byVaccine.get(o.vaccine);
    if (!existing || o.coveragePercent < existing.coveragePercent) {
      byVaccine.set(o.vaccine, o);
    }
  }

  const order = ["MMR", "DTaP", "IPV", "Hepatitis B"];
  const picked = order
    .map((v) => byVaccine.get(v))
    .filter((o): o is OutbreakAlert => Boolean(o));

  if (picked.length >= limit) return picked.slice(0, limit);

  return [...byVaccine.values()]
    .sort(
      (a, b) =>
        severityOrder(b.severity) - severityOrder(a.severity) ||
        a.coveragePercent - b.coveragePercent,
    )
    .slice(0, limit);
}

export function outbreakSummary(alerts: OutbreakAlert[]) {
  const urgent = alerts.filter((a) => a.severity === "urgent").length;
  const late = alerts.filter(
    (a) => a.severity === "high" || a.severity === "elevated",
  ).length;
  return { urgent, late, watch: alerts.length - urgent - late };
}

function severityOrder(s: OutbreakSeverity): number {
  switch (s) {
    case "urgent":
      return 3;
    case "high":
      return 2;
    case "elevated":
      return 1;
    case "watch":
      return 0;
  }
}

export const outbreakSeverityColor: Record<
  OutbreakSeverity,
  { chip: string; ring: string; dot: string }
> = {
  urgent: {
    chip: "bg-rose-50 text-rose-700 ring-rose-200",
    ring: "ring-rose-200",
    dot: "bg-rose-600",
  },
  high: {
    chip: "bg-orange-50 text-orange-700 ring-orange-200",
    ring: "ring-orange-200",
    dot: "bg-orange-500",
  },
  elevated: {
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
  },
  watch: {
    chip: "bg-sky-50 text-sky-700 ring-sky-200",
    ring: "ring-sky-200",
    dot: "bg-sky-500",
  },
};

/** Coverage heatmap rows for the public health view. */
export type HeatmapRow = {
  municipality: Municipality;
  coveragePercent: number;
  registeredChildren: number;
  overdue: number;
  riskTone: "safe" | "watch" | "warn" | "danger";
  riskScore: number;
};

export function coverageHeatmap(): HeatmapRow[] {
  return municipalityAnalytics
    .map((m) => {
      const tone =
        m.coveragePercent < 70
          ? "danger"
          : m.coveragePercent < 80
            ? "warn"
            : m.coveragePercent < 90
              ? "watch"
              : "safe";
      // Composite "regional preventive risk" 0–100
      const riskScore = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (100 - m.coveragePercent) * 0.7 +
              (m.overdueVaccines / Math.max(1, m.registeredChildren)) * 200,
          ),
        ),
      );
      return {
        municipality: m.municipality,
        coveragePercent: m.coveragePercent,
        registeredChildren: m.registeredChildren,
        overdue: m.overdueVaccines,
        riskTone: tone as HeatmapRow["riskTone"],
        riskScore,
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

export const heatmapToneColor: Record<HeatmapRow["riskTone"], string> = {
  safe: "bg-emerald-500",
  watch: "bg-sky-500",
  warn: "bg-amber-500",
  danger: "bg-rose-600",
};
