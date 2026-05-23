import { Injectable } from "@nestjs/common";
import { Municipality } from "../domain/types";
import { DataStoreService } from "../database/data-store.service";

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

const DISEASE_VACCINE_PAIRS = [
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

@Injectable()
export class OutbreakEngine {
  constructor(private readonly store: DataStoreService) {}

  detectOutbreaks(): OutbreakAlert[] {
    const out: OutbreakAlert[] = [];
    for (const m of this.store.municipalityAnalytics) {
      const childrenHere = this.store.children.filter(
        (c) => c.municipality === m.municipality,
      );
      for (const pair of DISEASE_VACCINE_PAIRS) {
        const offset = VACCINE_OFFSET[pair.vaccine] ?? 0;
        const coverage = Math.max(
          40,
          Math.min(99, m.coveragePercent + offset),
        );
        if (coverage >= pair.threshold) continue;
        const atRiskShare = Math.round(
          m.registeredChildren * ((pair.threshold - coverage) / 100),
        );
        const sev = this.severityFor(coverage, atRiskShare);
        out.push({
          id: `out-${m.municipality}-${pair.vaccine}`,
          municipality: m.municipality,
          disease: pair.disease,
          vaccine: pair.vaccine,
          coveragePercent: coverage,
          targetPercent: pair.threshold,
          childrenAtRisk: atRiskShare,
          daysToAct: this.daysToActFor(sev),
          severity: sev,
          headline:
            sev === "urgent"
              ? `Rrezik shpërthimi i ${pair.disease} — ${m.municipality}`
              : `Mbulim i ulët i ${pair.vaccine} në ${m.municipality}`,
          detail: `Mbulimi me ${pair.vaccine} në ${coverage}% (objektivi ≥${pair.threshold}%). ~${atRiskShare} fëmijë në ${m.municipality}.`,
          recommendedAction:
            sev === "urgent"
              ? `Lansoni menjëherë fushatë rikthimi për ${pair.vaccine} në ${m.municipality}.`
              : `Planifiko fushatë për ${pair.vaccine} brenda 30 ditëve.`,
        });
      }
    }
    return out.sort(
      (a, b) => this.severityOrder(b.severity) - this.severityOrder(a.severity),
    );
  }

  topOutbreakRisks(limit = 4): OutbreakAlert[] {
    const all = this.detectOutbreaks();
    const focusMunicipality =
      this.store.municipalityAnalytics
        .slice()
        .sort((a, b) => a.coveragePercent - b.coveragePercent)[0]
        ?.municipality ?? "Mitrovica";
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
          this.severityOrder(b.severity) - this.severityOrder(a.severity) ||
          a.coveragePercent - b.coveragePercent,
      )
      .slice(0, limit);
  }

  outbreakSummary(alerts: OutbreakAlert[]) {
    const urgent = alerts.filter((a) => a.severity === "urgent").length;
    const late = alerts.filter(
      (a) => a.severity === "high" || a.severity === "elevated",
    ).length;
    return { urgent, late, watch: alerts.length - urgent - late };
  }

  coverageHeatmap() {
    return this.store.municipalityAnalytics
      .map((m) => {
        const tone =
          m.coveragePercent < 70
            ? "danger"
            : m.coveragePercent < 80
              ? "warn"
              : m.coveragePercent < 90
                ? "watch"
                : "safe";
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
          riskTone: tone,
          riskScore,
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  private severityFor(coverage: number, atRisk: number): OutbreakSeverity {
    if (coverage < 65 && atRisk >= 25) return "urgent";
    if (coverage < 70) return "high";
    if (coverage < 80) return "elevated";
    return "watch";
  }

  private daysToActFor(sev: OutbreakSeverity): number {
    if (sev === "urgent") return 14;
    if (sev === "high") return 30;
    if (sev === "elevated") return 45;
    return 60;
  }

  private severityOrder(s: OutbreakSeverity): number {
    return { urgent: 3, high: 2, elevated: 1, watch: 0 }[s];
  }
}
