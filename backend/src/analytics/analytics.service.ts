import { Injectable } from "@nestjs/common";
import { DataStoreService } from "../database/data-store.service";
import { OutbreakEngine } from "../engines/outbreak.engine";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly store: DataStoreService,
    private readonly outbreak: OutbreakEngine,
  ) {}

  dashboard() {
    const total = this.store.municipalityAnalytics.reduce(
      (acc, m) => ({
        registered: acc.registered + m.registeredChildren,
        overdue: acc.overdue + m.overdueVaccines,
        missed: acc.missed + m.missedCheckups,
        high: acc.high + m.highRiskChildren,
      }),
      { registered: 0, overdue: 0, missed: 0, high: 0 },
    );
    const weightedCoverage = Math.round(
      this.store.municipalityAnalytics.reduce(
        (acc, m) => acc + m.coveragePercent * m.registeredChildren,
        0,
      ) / Math.max(1, total.registered),
    );
    const outbreaks = this.outbreak.detectOutbreaks();
    const vaccinePanel = this.outbreak.topOutbreakRisks(4);

    return {
      summary: {
        weightedCoveragePercent: weightedCoverage,
        ...total,
      },
      municipalities: this.store.municipalityAnalytics,
      monthlyTrend: this.store.monthlyTrend,
      ageBucketStats: this.store.ageBucketStats,
      outbreak: {
        alerts: outbreaks,
        vaccinePanel,
        summary: this.outbreak.outbreakSummary(vaccinePanel),
      },
      heatmap: this.outbreak.coverageHeatmap(),
      campaigns: this.store.campaigns,
      recommendedActions: outbreaks.slice(0, 3).map((o) => ({
        municipality: o.municipality,
        action: o.recommendedAction,
      })),
    };
  }

  outbreaks() {
    return this.outbreak.detectOutbreaks();
  }

  outbreakVaccinePanel() {
    const panel = this.outbreak.topOutbreakRisks(4);
    return {
      vaccines: panel,
      summary: this.outbreak.outbreakSummary(panel),
    };
  }

  heatmap() {
    return this.outbreak.coverageHeatmap();
  }

  campaigns() {
    return this.store.campaigns;
  }
}
