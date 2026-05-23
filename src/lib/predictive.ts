import { Child, RiskAlert, Vaccine } from "./types";
import { diffInDays } from "./utils";
import {
  appointments as allAppointments,
  growthRecords as allGrowth,
  milestones as allMilestones,
  reminders as allReminders,
  vaccines as allVaccines,
  riskAlerts as allRiskAlerts,
  municipalityAnalytics,
} from "./mock-data";
import { scoreFor, RiskBreakdown } from "./risk";

/**
 * Predictive "What Happens If…" engine.
 *
 * This is a deterministic, transparent forecasting model — not a black-box.
 * Given the child's current preventive state, it projects how the
 * preventive-risk score will evolve over the next 14/30/60/90 days *if no
 * action is taken*. It does NOT predict disease — it predicts the **gap**
 * in preventive care.
 */

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
    /** Highest level reached over the horizon. */
    level: RiskBreakdown["level"];
    headline: string;
    detail: string;
    daysUntilHigh: number | null;
    daysUntilCritical: number | null;
  };
};

const HORIZON_DAYS = [14, 30, 60, 90] as const;

/**
 * Deltas (per day) we apply to model future degradation if no preventive
 * action is taken. All values are intentionally conservative.
 */
const DAILY_DELTAS = {
  overdueVaccinePerDay: 0.35, // each overdue vaccine adds this every day
  missedCheckupPerDay: 0.15,
  missingGrowthAfter90d: 0.1,
  ignoredReminderPerDay: 0.05,
  delayedMilestonePerDay: 0.05,
  incompleteProfileFlat: 0, // doesn't worsen with time
};

function levelFor(score: number): RiskBreakdown["level"] {
  return score >= 76
    ? "critical"
    : score >= 51
      ? "high"
      : score >= 21
        ? "medium"
        : "low";
}

function overdueVaccinesFor(childId: string): Vaccine[] {
  return allVaccines.filter(
    (v) => v.childId === childId && (v.status === "overdue" || v.status === "catch-up"),
  );
}

function lastCheckupDays(childId: string): number | null {
  const last = allAppointments
    .filter(
      (a) =>
        a.childId === childId &&
        a.service === "routine-checkup" &&
        a.status === "completed",
    )
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
  if (!last) return null;
  return Math.abs(diffInDays(last.date));
}

function lastGrowthDays(childId: string): number | null {
  const last = allGrowth
    .filter((g) => g.childId === childId)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
  if (!last) return null;
  return Math.abs(diffInDays(last.date));
}

function delayedMilestoneCount(childId: string): number {
  return allMilestones.filter(
    (m) =>
      m.childId === childId &&
      (m.status === "delayed" || m.status === "review"),
  ).length;
}

function ignoredReminderCount(childId: string): number {
  return allReminders.filter(
    (r) =>
      r.childId === childId &&
      (r.type === "missed-vaccine" || r.type === "missed-checkup"),
  ).length;
}

function profileIncomplete(child: Child): boolean {
  return !child.emergencyContact?.name || !child.emergencyContact?.phone;
}

function lowCoverageMunicipality(child: Child): boolean {
  const mun = municipalityAnalytics.find(
    (m) => m.municipality === child.municipality,
  );
  return !!mun && mun.coveragePercent < 75;
}

function forecastAt(child: Child, daysAhead: number): ForecastPoint {
  const today = scoreFor(child);
  const reasons: { label: string; addedPoints: number }[] = [];

  let added = 0;

  const ovx = overdueVaccinesFor(child.id);
  if (ovx.length > 0) {
    const p = +(ovx.length * DAILY_DELTAS.overdueVaccinePerDay * daysAhead).toFixed(1);
    if (p > 0) {
      reasons.push({
        label: `${ovx.length} ${
          ovx.length > 1 ? "vaksina" : "vaksinë"
        } vazhdojnë të vonohen edhe më shumë`,
        addedPoints: p,
      });
      added += p;
    }
  }

  const lc = lastCheckupDays(child.id);
  if (lc === null || lc > 150) {
    const p = +(DAILY_DELTAS.missedCheckupPerDay * daysAhead).toFixed(1);
    reasons.push({
      label: "Asnjë kontroll rutinor i planifikuar brenda 6 muajve",
      addedPoints: p,
    });
    added += p;
  }

  const lg = lastGrowthDays(child.id);
  if (lg === null || lg > 60) {
    const p = +(DAILY_DELTAS.missingGrowthAfter90d * daysAhead).toFixed(1);
    reasons.push({
      label: "Matjet e rritjes vjetërohen edhe më tepër",
      addedPoints: p,
    });
    added += p;
  }

  const ms = delayedMilestoneCount(child.id);
  if (ms > 0) {
    const p = +(ms * DAILY_DELTAS.delayedMilestonePerDay * daysAhead).toFixed(1);
    reasons.push({
      label: `${ms} ${
        ms > 1 ? "etapa zhvillimore" : "etapë zhvillimore"
      } mbeten për shqyrtim`,
      addedPoints: p,
    });
    added += p;
  }

  const ig = ignoredReminderCount(child.id);
  if (ig >= 1) {
    const p = +(ig * DAILY_DELTAS.ignoredReminderPerDay * daysAhead).toFixed(1);
    reasons.push({
      label: "Kujtesat mbeten pa përgjigje",
      addedPoints: p,
    });
    added += p;
  }

  if (profileIncomplete(child)) {
    reasons.push({
      label: "Profili i fëmijës i paplotë (mungon kontakti i emergjencës)",
      addedPoints: 0,
    });
  }

  if (lowCoverageMunicipality(child)) {
    reasons.push({
      label: `${child.municipality} ka mbulim nën 75%`,
      addedPoints: 0,
    });
  }

  const score = Math.min(100, Math.round((today.score + added) * 10) / 10);
  return {
    daysAhead,
    label: daysAhead === 0 ? "Sot" : `+${daysAhead}d`,
    score,
    level: levelFor(score),
    reasons,
  };
}

export function forecastFor(child: Child): RiskForecast {
  const today = forecastAt(child, 0);
  const horizon = HORIZON_DAYS.map((d) => forecastAt(child, d));
  const worstCase = [today, ...horizon].reduce((acc, cur) =>
    cur.score > acc.score ? cur : acc,
  );

  const firstHigh = horizon.find((p) => p.score >= 51);
  const firstCritical = horizon.find((p) => p.score >= 76);

  const headline =
    worstCase.level === "critical"
      ? `KRITIK (${worstCase.score}%) për ${worstCase.daysAhead}d pa veprim.`
      : worstCase.level === "high"
        ? `I LARTË (${worstCase.score}%) për ${worstCase.daysAhead}d pa veprim.`
        : worstCase.level === "medium"
          ? `Boshllëqe në rritje për 90d pa përgjigje.`
          : `Stabil për 90 ditë.`;

  const detail =
    worstCase.score > today.score
      ? `+${(worstCase.score - today.score).toFixed(1)} pikë për ${worstCase.daysAhead}d.`
      : "Pikët stabile.";

  return {
    today,
    horizon,
    worstCase,
    outcome: {
      level: worstCase.level,
      headline,
      detail,
      daysUntilHigh: firstHigh?.daysAhead ?? null,
      daysUntilCritical: firstCritical?.daysAhead ?? null,
    },
  };
}

/**
 * Build the "Why this alert?" explanation for an AI risk alert. Returns the
 * underlying evidence the engine used — the trust layer.
 */
export type ExplanationFact = {
  label: string;
  detail: string;
};

export function explainAlert(alert: RiskAlert, child: Child): ExplanationFact[] {
  const facts: ExplanationFact[] = [];

  switch (alert.type) {
    case "delayed-vaccination":
    case "missed-vaccination": {
      const ov = overdueVaccinesFor(child.id);
      if (ov.length > 0) {
        const top = ov.sort(
          (a, b) => +new Date(a.dueDate) - +new Date(b.dueDate),
        )[0];
        const daysOverdue = Math.abs(diffInDays(top.dueDate));
        facts.push({
          label: `Vaksina ${top.name}`,
          detail: `${daysOverdue} ${daysOverdue === 1 ? "ditë" : "ditë"} pas datës së rekomanduar.`,
        });
        if (ov.length > 1) {
          facts.push({
            label: `Edhe ${ov.length - 1} ${
              ov.length - 1 === 1 ? "vaksinë" : "vaksina"
            } me vonesë`,
            detail: ov
              .slice(1)
              .map((v) => v.name)
              .join(", "),
          });
        }
      }
      const future = allAppointments
        .filter((a) => a.childId === child.id && a.status === "confirmed")
        .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];
      facts.push({
        label: "Asnjë vizitë vijuese e caktuar",
        detail: future
          ? `Vizita më e afërt është më ${future.date}, jo për vaksinim.`
          : "Asnjë vizitë e ardhshme e rezervuar për këtë fëmijë.",
      });
      const ig = ignoredReminderCount(child.id);
      if (ig > 0) {
        facts.push({
          label: "Kujtesa të mëparshme të injoruara",
          detail: `${ig} ${ig === 1 ? "kujtesë" : "kujtesa"} për vaksina/kontrolle të palexuara.`,
        });
      }
      break;
    }
    case "missed-checkup": {
      const lc = lastCheckupDays(child.id);
      facts.push({
        label: "Kontrolli i fundit rutinor",
        detail:
          lc === null
            ? "Asnjë kontroll rutinor i regjistruar për këtë fëmijë."
            : `${lc} ditë nga kontrolli i fundit i kryer.`,
      });
      facts.push({
        label: "Ritmi i rekomanduar",
        detail:
          "Fëmijët nën 5 vjeç zakonisht bëjnë kontroll rutinor çdo 6 muaj.",
      });
      break;
    }
    case "missing-growth": {
      const lg = lastGrowthDays(child.id);
      facts.push({
        label: "Matja e fundit e rritjes",
        detail:
          lg === null
            ? "Asnjë regjistrim i rritjes në dosje."
            : `${lg} ditë nga matja e fundit e gjatësisë/peshës.`,
      });
      facts.push({
        label: "Pse ka rëndësi",
        detail:
          "Boshllëqet në rritje e bëjnë më të vështirë diagnostikimin e hershëm të problemeve të ushqyerjes dhe vonesave në zhvillim.",
      });
      break;
    }
    case "missing-milestone": {
      const ms = delayedMilestoneCount(child.id);
      facts.push({
        label: `${ms} ${ms === 1 ? "etapë zhvillimi" : "etapa zhvillimi"} kërkojnë shqyrtim nga mjeku`,
        detail: "Statusi është ose 'i vonuar' ose 'për shqyrtim'.",
      });
      break;
    }
    case "multiple-missed-reminders": {
      const ig = ignoredReminderCount(child.id);
      facts.push({
        label: "Kujtesa pa përgjigje",
        detail: `${ig} ${ig === 1 ? "kujtesë" : "kujtesa"} me prioritet të lartë ose kritik.`,
      });
      facts.push({
        label: "Model",
        detail:
          "Ky model lidhet me probabilitet më të lartë për humbjen e kujdesit të ardhshëm.",
      });
      break;
    }
    case "no-provider-confirmation": {
      const unconfirmed = allVaccines.filter(
        (v) =>
          v.childId === child.id &&
          v.status === "completed" &&
          !v.providerConfirmed,
      );
      facts.push({
        label: `${unconfirmed.length} ${
          unconfirmed.length === 1 ? "vaksinë" : "vaksina"
        } të kryera pa konfirmim nga mjeku`,
        detail:
          unconfirmed
            .slice(0, 3)
            .map((v) => v.name)
            .join(", ") +
          (unconfirmed.length > 3 ? `, +${unconfirmed.length - 3} të tjera` : ""),
      });
      facts.push({
        label: "Pse ka rëndësi",
        detail:
          "Vaksinat pa konfirmim mund të mos shfaqen në regjistrat zyrtarë të imunizimit.",
      });
      break;
    }
    case "incomplete-profile": {
      if (profileIncomplete(child)) {
        facts.push({
          label: "Kontakti i emergjencës",
          detail: "Nuk ka emër dhe numër telefoni të regjistruar.",
        });
      }
      if (child.allergies.length === 0 && child.chronicConditions.length === 0) {
        facts.push({
          label: "Alergjitë & sëmundjet",
          detail: "Fusha është bosh — konfirmo në mënyrë eksplicite me familjen.",
        });
      }
      break;
    }
    case "low-coverage-area": {
      const mun = municipalityAnalytics.find(
        (m) => m.municipality === child.municipality,
      );
      facts.push({
        label: `Mbulimi në ${child.municipality}`,
        detail: `Mbulimi aktual i vaksinimit në këtë komunë është ${mun?.coveragePercent ?? "?"}%.`,
      });
      facts.push({
        label: "Pse ka rëndësi",
        detail:
          "Fëmijët në zona me mbulim të ulët kanë mundësi më të lartë ekspozimi ndaj sëmundjeve.",
      });
      break;
    }
  }

  return facts;
}

/**
 * Bulk-build alerts including any computed-from-mock alerts that aren't
 * already in `riskAlerts`. Used by simplified views like the parent
 * "Active Alerts" card.
 */
export function activeAlertsFor(childId: string): RiskAlert[] {
  return allRiskAlerts.filter((a) => a.childId === childId);
}
