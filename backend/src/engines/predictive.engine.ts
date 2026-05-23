import { Injectable } from "@nestjs/common";
import { Child } from "../domain/types";
import { DataStoreService } from "../database/data-store.service";
import { diffInDays } from "../common/utils/date.util";
import { RiskBreakdown, RiskEngine } from "./risk.engine";

export type ForecastPoint = {
  daysAhead: number;
  label: string;
  score: number;
  level: RiskBreakdown["level"];
  reasons: { label: string; addedPoints: number }[];
};

export type RiskForecast = {
  today: ForecastPoint;
  horizon: ForecastPoint[];
  worstCase: ForecastPoint;
  outcome: {
    level: RiskBreakdown["level"];
    headline: string;
    detail: string;
    daysUntilHigh: number | null;
    daysUntilCritical: number | null;
  };
};

const HORIZON_DAYS = [14, 30, 60, 90] as const;
const DAILY_DELTAS = {
  overdueVaccinePerDay: 0.35,
  missedCheckupPerDay: 0.15,
  missingGrowthAfter90d: 0.1,
  ignoredReminderPerDay: 0.05,
  delayedMilestonePerDay: 0.05,
};

@Injectable()
export class PredictiveEngine {
  constructor(
    private readonly store: DataStoreService,
    private readonly risk: RiskEngine,
  ) {}

  forecastFor(child: Child): RiskForecast {
    const base = this.risk.scoreFor(child);
    const today: ForecastPoint = {
      daysAhead: 0,
      label: "Sot",
      score: base.score,
      level: base.level,
      reasons: base.reasons.map((r) => ({
        label: r.label,
        addedPoints: r.points,
      })),
    };

    const overdueCount = this.store.vaccines.filter(
      (v) =>
        v.childId === child.id &&
        (v.status === "overdue" || v.status === "catch-up"),
    ).length;
    const ignored = this.store.reminders.filter(
      (r) =>
        r.childId === child.id &&
        (r.type === "missed-vaccine" || r.type === "missed-checkup"),
    ).length;
    const delayedMs = this.store.milestones.filter(
      (m) =>
        m.childId === child.id &&
        (m.status === "delayed" || m.status === "review"),
    ).length;

    const horizon = HORIZON_DAYS.map((days) => {
      const delta =
        overdueCount * DAILY_DELTAS.overdueVaccinePerDay * days +
        ignored * DAILY_DELTAS.ignoredReminderPerDay * days +
        delayedMs * DAILY_DELTAS.delayedMilestonePerDay * days;
      const score = Math.min(100, Math.round(base.score + delta));
      const level = this.levelFor(score);
      return {
        daysAhead: days,
        label: `${days} ditë`,
        score,
        level,
        reasons: [
          {
            label: "Pa veprim parandalues",
            addedPoints: Math.round(delta),
          },
        ],
      };
    });

    const worstCase = horizon.reduce((w, p) => (p.score > w.score ? p : w), today);
    const daysUntilHigh =
      horizon.find((p) => p.level === "high" || p.level === "critical")
        ?.daysAhead ?? null;
    const daysUntilCritical =
      horizon.find((p) => p.level === "critical")?.daysAhead ?? null;

    return {
      today,
      horizon,
      worstCase,
      outcome: {
        level: worstCase.level,
        headline:
          worstCase.level === "critical"
            ? "Rrezik kritik brenda 90 ditëve pa veprim"
            : worstCase.level === "high"
              ? "Rrezik i lartë — kërkon ndërhyrje"
              : "Rreziku mbetet i menaxhueshëm",
        detail: `Skori mund të arrijë ${worstCase.score}/100 në ${worstCase.daysAhead || 0} ditë.`,
        daysUntilHigh,
        daysUntilCritical,
      },
    };
  }

  explainAlert(childId: string, alertId: string) {
    const alert = this.store.riskAlerts.find(
      (a) => a.id === alertId && a.childId === childId,
    );
    if (!alert) return null;
    return {
      alertId,
      childId,
      title: alert.title,
      evidence: [
        alert.explanation,
        `Veprim: ${alert.recommendedAction}`,
        `Prioritet: ${alert.priority}`,
      ],
      disclaimer:
        "Informacion parandalues — nuk zëvendëson diagnozën klinike.",
    };
  }

  private levelFor(score: number): RiskBreakdown["level"] {
    return score >= 76
      ? "critical"
      : score >= 51
        ? "high"
        : score >= 21
          ? "medium"
          : "low";
  }
}
