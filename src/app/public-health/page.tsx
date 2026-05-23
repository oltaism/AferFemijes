"use client";

import { Sparkles } from "lucide-react";
import { ApiBanner } from "@/components/api-banner";
import { PageHeader } from "@/components/page-header";
import { SafetyBanner } from "@/components/safety-banner";
import { OutbreakRiskSection } from "@/components/outbreak-risk-section";
import { fetchAnalyticsDashboard } from "@/lib/api/analytics";
import { useApiQuery } from "@/lib/hooks/use-api";
import { municipalityAnalytics } from "@/lib/mock-data";
import { coverageHeatmap, detectOutbreaks } from "@/lib/outbreak";
import type { HeatmapRow } from "@/lib/outbreak";

export default function PublicHealthPage() {
  const { data: api, fromApi, error, loading } = useApiQuery(
    fetchAnalyticsDashboard,
  );

  const municipalityAnalyticsData =
    api?.municipalities ?? municipalityAnalytics;

  const total = municipalityAnalyticsData.reduce(
    (acc, m) => ({
      registered: acc.registered + m.registeredChildren,
      overdue: acc.overdue + m.overdueVaccines,
      missed: acc.missed + m.missedCheckups,
      high: acc.high + m.highRiskChildren,
    }),
    { registered: 0, overdue: 0, missed: 0, high: 0 },
  );
  const weightedCoverage =
    api?.summary.weightedCoveragePercent ??
    Math.round(
      municipalityAnalyticsData.reduce(
        (acc, m) => acc + m.coveragePercent * m.registeredChildren,
        0,
      ) / total.registered,
    );

  const outbreaks = api?.outbreak.alerts ?? detectOutbreaks();
  const urgentOutbreaks = outbreaks.filter(
    (o) => o.severity === "urgent" || o.severity === "high",
  );
  const heatmap: HeatmapRow[] =
    (api?.heatmap as HeatmapRow[] | undefined) ?? coverageHeatmap();

  const displayTotal = api?.summary ?? total;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shëndeti publik"
        description="Mbulim anonim · rrezik shpërthimi."
        actions={
          <span className="chip bg-violet-50 text-violet-700 ring-violet-200">
            <Sparkles className="h-3.5 w-3.5" /> Shpërthime
          </span>
        }
      />

      <SafetyBanner />

      <ApiBanner fromApi={fromApi} error={error} />

      {loading ? (
        <div className="card h-24 animate-pulse bg-slate-100" />
      ) : null}

      <OutbreakRiskSection
        vaccinePanel={api?.outbreak.vaccinePanel}
        allAlerts={api?.outbreak.alerts}
        summary={api?.outbreak.summary}
        weightedCoverage={weightedCoverage}
        urgentOutbreaks={urgentOutbreaks}
        outbreaks={outbreaks}
        displayTotal={displayTotal}
        municipalityAnalyticsData={municipalityAnalyticsData}
        heatmap={heatmap}
        monthlyTrend={api?.monthlyTrend}
        ageBucketStats={api?.ageBucketStats}
      />
    </div>
  );
}
