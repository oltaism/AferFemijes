import { Injectable } from "@nestjs/common";
import { Child, Priority, RiskAlert } from "../domain/types";
import { DataStoreService } from "../database/data-store.service";
import { diffInDays } from "../common/utils/date.util";

export type RiskBreakdown = {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  reasons: { label: string; points: number }[];
};

@Injectable()
export class RiskEngine {
  constructor(private readonly store: DataStoreService) {}

  scoreFor(child: Child): RiskBreakdown {
    const reasons: { label: string; points: number }[] = [];
    const vx = this.store.vaccines.filter((v) => v.childId === child.id);
    const overdueVx = vx.filter((v) => v.status === "overdue");
    if (overdueVx.length > 0) {
      reasons.push({
        label: `Vaksinë me vonesë (${overdueVx.length})`,
        points: 30,
      });
    }

    const lastCheckup = this.store.appointments
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

    const recentGrowth = this.store.growthRecords
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
      !child.emergencyContact?.phone;
    if (profileIncomplete) {
      reasons.push({ label: "Profil i paplotë", points: 10 });
    }

    const ignored = this.store.reminders.filter(
      (r) =>
        r.childId === child.id &&
        (r.type === "missed-vaccine" || r.type === "missed-checkup"),
    );
    if (ignored.length >= 2) {
      reasons.push({ label: "Shumë kujtesa të humbura", points: 10 });
    }

    const mun = this.store.municipalityAnalytics.find(
      (m) => m.municipality === child.municipality,
    );
    if (mun && mun.coveragePercent < 75) {
      reasons.push({ label: "Zonë me mbulim të ulët", points: 10 });
    }

    const milestonesDelayed = this.store.milestones.filter(
      (m) =>
        m.childId === child.id &&
        (m.status === "delayed" || m.status === "review"),
    );
    if (milestonesDelayed.length > 0) {
      reasons.push({ label: "Etapë me vonesë", points: 10 });
    }

    const score = Math.min(
      100,
      reasons.reduce((s, r) => s + r.points, 0),
    );
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

  alertsFor(childId: string): RiskAlert[] {
    return this.store.riskAlerts.filter((r) => r.childId === childId);
  }
}
