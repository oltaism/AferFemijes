import {
  Child,
  Priority,
  RiskAlert,
  Vaccine,
} from "./types";
import {
  appointments as allAppointments,
  growthRecords as allGrowth,
  milestones as allMilestones,
  municipalityAnalytics,
  reminders as allReminders,
  vaccines as allVaccines,
} from "./mock-data";
import { diffInDays } from "./utils";

export type RiskBreakdown = {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  reasons: { label: string; points: number }[];
};

export function scoreFor(child: Child): RiskBreakdown {
  const reasons: { label: string; points: number }[] = [];

  const vx = allVaccines.filter((v) => v.childId === child.id);
  const overdueVx = vx.filter((v) => v.status === "overdue");
  if (overdueVx.length > 0) {
    reasons.push({
      label: `Vaksinë me vonesë (${overdueVx.length})`,
      points: 30,
    });
  }

  const lastCheckup = allAppointments
    .filter(
      (a) =>
        a.childId === child.id &&
        a.service === "routine-checkup" &&
        a.status === "completed",
    )
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
  const missedCheckup =
    !lastCheckup || diffInDays(lastCheckup.date) < -180;
  if (missedCheckup) {
    reasons.push({
      label: "Kontroll rutinor i humbur (6+ muaj)",
      points: 25,
    });
  }

  const recentGrowth = allGrowth
    .filter((g) => g.childId === child.id)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
  if (!recentGrowth || diffInDays(recentGrowth.date) < -90) {
    reasons.push({
      label: "Mungon regjistrimi i rritjes (3+ muaj)",
      points: 15,
    });
  }

  const profileIncomplete =
    !child.emergencyContact?.name ||
    !child.emergencyContact?.phone ||
    child.allergies === undefined;
  if (profileIncomplete) {
    reasons.push({ label: "Profil i paplotë", points: 10 });
  }

  const ignored = allReminders.filter(
    (r) =>
      r.childId === child.id &&
      (r.type === "missed-vaccine" || r.type === "missed-checkup"),
  );
  if (ignored.length >= 2) {
    reasons.push({ label: "Shumë kujtesa të humbura", points: 10 });
  }

  const mun = municipalityAnalytics.find(
    (m) => m.municipality === child.municipality,
  );
  if (mun && mun.coveragePercent < 75) {
    reasons.push({ label: "Zonë me mbulim të ulët", points: 10 });
  }

  const milestonesDelayed = allMilestones.filter(
    (m) =>
      m.childId === child.id &&
      (m.status === "delayed" || m.status === "review"),
  );
  if (milestonesDelayed.length > 0) {
    reasons.push({ label: "Etapë me vonesë", points: 10 });
  }

  let score = reasons.reduce((s, r) => s + r.points, 0);
  score = Math.min(100, score);

  const level: RiskBreakdown["level"] =
    score >= 76
      ? "critical"
      : score >= 51
        ? "high"
        : score >= 21
          ? "medium"
          : "low";

  return { score, level, reasons };
}

export function priorityColor(priority: Priority): string {
  switch (priority) {
    case "low":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "medium":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "high":
      return "bg-orange-50 text-orange-700 ring-orange-200";
    case "critical":
      return "bg-rose-50 text-rose-700 ring-rose-200";
  }
}

export function riskLevelColor(level: RiskBreakdown["level"]): string {
  switch (level) {
    case "low":
      return "bg-emerald-500";
    case "medium":
      return "bg-amber-500";
    case "high":
      return "bg-orange-500";
    case "critical":
      return "bg-rose-600";
  }
}

export function vaccineStatusColor(status: Vaccine["status"]): string {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "upcoming":
      return "bg-sky-50 text-sky-700 ring-sky-200";
    case "overdue":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "catch-up":
      return "bg-violet-50 text-violet-700 ring-violet-200";
  }
}

export function careStatusColor(status: Child["status"]): string {
  switch (status) {
    case "up-to-date":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "due-soon":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "overdue":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "needs-review":
      return "bg-violet-50 text-violet-700 ring-violet-200";
  }
}
