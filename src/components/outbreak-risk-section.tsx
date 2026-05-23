"use client";

import { useMemo, useState } from "react";
import {
  AlertOctagon,
  BarChart3,
  CalendarX2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Syringe,
  Users,
} from "lucide-react";
import { fetchOutbreakVaccinePanel } from "@/lib/api/analytics";
import { useApiQuery } from "@/lib/hooks/use-api";
import type { MunicipalityAnalytics } from "@/lib/types";
import {
  OutbreakAlert,
  detectOutbreaks,
  municipalityLabel,
  outbreakSummary,
  topOutbreakRisks,
} from "@/lib/outbreak";
import type { HeatmapRow } from "@/lib/outbreak";
import { AgeBucketChart } from "@/components/charts/age-bucket-chart";
import { CoverageTrendChart } from "@/components/charts/coverage-trend-chart";
import { MunicipalityCoverageChart } from "@/components/charts/municipality-bar-chart";
import { CoverageHeatmap } from "@/components/coverage-heatmap";
import { StatCard } from "@/components/stat-card";
import { OutbreakVaccineCard } from "./outbreak-vaccine-card";
import { cn } from "@/lib/utils";
import { ApiBanner } from "./api-banner";

type Tab = "alarmet" | "vaksina" | "statistikat";

const TABS: { id: Tab; label: string }[] = [
  { id: "alarmet", label: "Alarmet" },
  { id: "vaksina", label: "Vaksina" },
  { id: "statistikat", label: "Statistikat" },
];

function matchesSearch(alert: OutbreakAlert, q: string) {
  const hay = [
    alert.disease,
    alert.vaccine,
    alert.municipality,
    municipalityLabel[alert.municipality],
    alert.headline,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export type OutbreakRiskSectionProps = {
  vaccinePanel?: OutbreakAlert[];
  allAlerts?: OutbreakAlert[];
  summary?: { urgent: number; late: number; watch: number };
  weightedCoverage: number;
  urgentOutbreaks: OutbreakAlert[];
  outbreaks: OutbreakAlert[];
  displayTotal: {
    registered: number;
    overdue: number;
    missed: number;
    high: number;
  };
  municipalityAnalyticsData: MunicipalityAnalytics[];
  heatmap: HeatmapRow[];
  monthlyTrend?: { month: string; coverage: number; overdue: number }[];
  ageBucketStats?: {
    age: string;
    missedCheckups: number;
    overdueVaccines: number;
  }[];
};

export function OutbreakRiskSection({
  vaccinePanel: vaccinePanelProp,
  allAlerts: allAlertsProp,
  summary: summaryProp,
  weightedCoverage,
  urgentOutbreaks,
  outbreaks,
  displayTotal,
  municipalityAnalyticsData,
  heatmap,
  monthlyTrend,
  ageBucketStats,
}: OutbreakRiskSectionProps) {
  const [tab, setTab] = useState<Tab>("vaksina");
  const [query, setQuery] = useState("");
  const { data: panelApi, fromApi, error } = useApiQuery(
    fetchOutbreakVaccinePanel,
  );

  const vaccineCards = useMemo(
    () =>
      vaccinePanelProp ?? panelApi?.vaccines ?? topOutbreakRisks(4),
    [vaccinePanelProp, panelApi],
  );
  const allAlerts = useMemo(
    () => allAlertsProp ?? detectOutbreaks(),
    [allAlertsProp],
  );
  const summary = useMemo(
    () =>
      summaryProp ?? panelApi?.summary ?? outbreakSummary(vaccineCards),
    [summaryProp, panelApi, vaccineCards],
  );

  const q = query.trim().toLowerCase();
  const filteredVaccines = useMemo(
    () => (q ? vaccineCards.filter((a) => matchesSearch(a, q)) : vaccineCards),
    [vaccineCards, q],
  );
  const filteredAlarms = useMemo(
    () =>
      q
        ? allAlerts.filter((a) => matchesSearch(a, q)).slice(0, 8)
        : allAlerts.slice(0, 8),
    [allAlerts, q],
  );

  const avgCoverage = Math.round(
    vaccineCards.reduce((s, a) => s + a.coveragePercent, 0) /
      Math.max(1, vaccineCards.length),
  );
  const childrenAtRisk = vaccineCards.reduce(
    (s, a) => s + a.childrenAtRisk,
    0,
  );

  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50 via-[#f7f5f2] to-slate-50/80 shadow-card"
      aria-labelledby="outbreak-risk-heading"
    >
      <div className="border-b border-slate-200/60 bg-white px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2
              id="outbreak-risk-heading"
              className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.65rem]"
            >
              Rreziku i shpërthimeve
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Monitorimi i vaksinimit · Kosovë
            </p>
          </div>
          {tab !== "statistikat" ? (
            <label className="relative w-full lg:max-w-[220px]">
              <span className="sr-only">Kërko</span>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kërko..."
                className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </label>
          ) : null}
        </div>

        <nav
          className="mt-5 flex gap-8 border-b border-slate-200"
          aria-label="Seksionet e rrezikut"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "-mb-px border-b-[2.5px] pb-3 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
        <ApiBanner
          fromApi={fromApi || Boolean(vaccinePanelProp)}
          error={error}
        />

        {tab === "vaksina" ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:max-w-xs">
              <StatCard
                label="Vaksina me vonesë"
                value={displayTotal.overdue}
                icon={AlertOctagon}
                tone="bad"
              />
            </div>
            {filteredVaccines.length === 0 ? (
              <p className="rounded-2xl border border-slate-200/60 bg-white p-8 text-center text-sm text-slate-600">
                {q
                  ? `Asnjë rezultat për «${query}».`
                  : "Nuk ka të dhëna vaksinash për momentin."}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredVaccines.map((alert) => (
                  <OutbreakVaccineCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {tab === "alarmet" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-5">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-rose-500"
                    aria-hidden
                  />
                  <strong className="font-semibold text-slate-900">
                    {summary.urgent}
                  </strong>{" "}
                  urgjente
                </span>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-amber-500"
                    aria-hidden
                  />
                  <strong className="font-semibold text-slate-900">
                    {summary.late}
                  </strong>{" "}
                  me vonesë
                </span>
              </div>
              <span className="text-slate-500">Përditësuar sot</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard
                label="Kontrolle të humbura"
                value={displayTotal.missed}
                icon={CalendarX2}
                tone="warn"
              />
              <StatCard
                label="Fëmijë me rrezik të lartë"
                value={displayTotal.high}
                icon={ShieldAlert}
                tone="info"
              />
            </div>

            <ul className="space-y-2">
              {filteredAlarms.length === 0 ? (
                <li className="rounded-2xl border border-slate-200/60 bg-white p-8 text-center text-sm text-slate-600">
                  Asnjë alarm.
                </li>
              ) : (
                filteredAlarms.map((a) => (
                  <li
                    key={a.id}
                    className="flex gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card"
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
                        a.severity === "urgent"
                          ? "bg-rose-50 text-rose-600 ring-rose-200/80"
                          : "bg-amber-50 text-amber-700 ring-amber-200/80",
                      )}
                    >
                      {a.severity === "urgent" ? (
                        <AlertOctagon className="h-4 w-4" />
                      ) : (
                        <ShieldAlert className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">
                        {a.headline}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                        {a.detail}
                      </p>
                      <p className="mt-2 text-[11px] font-medium text-brand-700">
                        {a.recommendedAction}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>

            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
              <h3 className="font-semibold text-slate-900">
                Fushatat e rekomanduara (të sugjeruara nga AI)
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {outbreaks.slice(0, 3).map((o) => (
                  <li
                    key={o.id}
                    className="flex items-start gap-2 rounded-xl bg-slate-50 p-3"
                  >
                    <Sparkles
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600"
                      aria-hidden
                    />
                    <div>
                      <strong className="text-slate-900">
                        {o.municipality}:
                      </strong>{" "}
                      {o.recommendedAction}
                    </div>
                  </li>
                ))}
                {outbreaks.length === 0 ? (
                  <li className="rounded-xl bg-emerald-50 p-3 ring-1 ring-inset ring-emerald-200">
                    Asnjë rajon nuk ka nevojë për fushatë urgjente për
                    momentin.
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        ) : null}

        {tab === "statistikat" ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-5 sm:p-6">
              <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <span className="chip bg-white/80 text-violet-700 ring-violet-200">
                    <BarChart3 className="h-3.5 w-3.5" /> Përmbledhje kombëtare
                  </span>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {weightedCoverage}% mbulim
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {urgentOutbreaks.length === 0 ? (
                      <>
                        Asnjë shpërthim urgjent. {outbreaks.length} në
                        monitorim.
                      </>
                    ) : (
                      <>
                        <strong className="text-rose-700">
                          {urgentOutbreaks.length} rrezik
                          {urgentOutbreaks.length === 1 ? "" : "e"} urgjent
                          {urgentOutbreaks.length === 1 ? "" : "e"} shpërthimi
                        </strong>{" "}
                        në komuna — veprim i shpejtë.
                      </>
                    )}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 ring-inset",
                    urgentOutbreaks.length === 0
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-rose-50 text-rose-700 ring-rose-200",
                  )}
                >
                  {urgentOutbreaks.length === 0 ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <AlertOctagon className="h-5 w-5" />
                  )}
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wide opacity-70">
                      Statusi i rrezikut
                    </div>
                    <div className="text-sm font-semibold">
                      {urgentOutbreaks.length === 0
                        ? "Stabil"
                        : `${urgentOutbreaks.length} zona të nxehta`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard
                label="Mbulimi (i peshuar)"
                value={`${weightedCoverage}%`}
                icon={Syringe}
                tone="info"
              />
              <StatCard
                label="Fëmijë të regjistruar"
                value={displayTotal.registered.toLocaleString()}
                icon={Users}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatBox
                label="Mbulim mesatar (4 vaksina)"
                value={`${avgCoverage}%`}
                tone="brand"
              />
              <StatBox
                label="Fëmijë në rrezik (vlerësim)"
                value={`~${childrenAtRisk}`}
                tone="warn"
              />
              <StatBox
                label="Komuna më e prekur"
                value={
                  vaccineCards.length
                    ? municipalityLabel[
                        [...vaccineCards].sort(
                          (a, b) => a.coveragePercent - b.coveragePercent,
                        )[0].municipality
                      ]
                    : "—"
                }
                tone="neutral"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <CoverageHeatmap rows={heatmap} />
              <MunicipalityCoverageChart
                municipalities={municipalityAnalyticsData}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <CoverageTrendChart data={monthlyTrend} />
              <AgeBucketChart data={ageBucketStats} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function StatBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "brand" | "warn" | "neutral";
}) {
  const tones = {
    brand: "border-brand-200/60 bg-brand-50/80 text-brand-900",
    warn: "border-amber-200/60 bg-amber-50/90 text-amber-950",
    neutral: "border-slate-200/70 bg-white text-slate-900",
  };
  return (
    <div className={cn("rounded-2xl border p-4 shadow-card", tones[tone])}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl font-bold tracking-tight">
        {value}
      </p>
    </div>
  );
}
