"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Brain, Sparkles } from "lucide-react";
import { ApiBanner } from "@/components/api-banner";
import { PageHeader } from "@/components/page-header";
import { RiskPanel } from "@/components/risk-panel";
import { PredictiveChart } from "@/components/predictive-chart";
import { SafetyBanner } from "@/components/safety-banner";
import {
  fetchAiAlerts,
  fetchAiForecast,
  fetchAiPortfolio,
} from "@/lib/api/ai-risk";
import { useSession } from "@/lib/store";
import { children, risksFor } from "@/lib/mock-data";
import { scoreFor } from "@/lib/risk";
import { forecastFor } from "@/lib/predictive";
import type { Child, RiskAlert } from "@/lib/types";
import type { RiskBreakdown } from "@/lib/risk";
import type { RiskForecast } from "@/lib/predictive";

type ChildRiskBlock = {
  child: Child;
  breakdown: RiskBreakdown;
  alerts: RiskAlert[];
  forecast: RiskForecast;
};

export default function ParentRiskPage() {
  const token = useSession((s) => s.accessToken);
  const [blocks, setBlocks] = useState<ChildRiskBlock[]>([]);
  const [fromApi, setFromApi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockBlocks = children
      .filter((c) => c.parentId === "parent-1")
      .map((c) => ({
        child: c,
        breakdown: scoreFor(c),
        alerts: risksFor(c.id),
        forecast: forecastFor(c),
      }));

    if (!token) {
      setBlocks(mockBlocks);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchAiPortfolio(token)
      .then(async (portfolio) => {
        const enriched = await Promise.all(
          portfolio.map(async (p) => {
            const [forecastRes, alerts] = await Promise.all([
              fetchAiForecast(token, p.childId),
              fetchAiAlerts(token, p.childId),
            ]);
            const child =
              children.find((c) => c.id === p.childId) ??
              ({
                id: p.childId,
                fullName: p.fullName,
                parentId: "parent-1",
              } as Child);
            return {
              child: { ...child, fullName: p.fullName },
              breakdown: p.risk,
              alerts,
              forecast: forecastRes.forecast,
            };
          }),
        );
        if (!cancelled) {
          setBlocks(enriched);
          setFromApi(true);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBlocks(mockBlocks);
          setFromApi(false);
          setError("Nuk u arrit lidhja me shërbimin.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/parent"
        backLabel="Kthehu te paneli"
        title="Paralajmërim nga AI"
        description="Parashikim rreziku · pa diagnozë."
        actions={
          <span className="chip bg-violet-50 text-violet-700 ring-violet-200">
            <Sparkles className="h-3.5 w-3.5" /> Parashikim
          </span>
        }
      />

      <ApiBanner fromApi={fromApi} error={error} />
      <SafetyBanner variant="ai" />

      {loading ? (
        <div className="card h-32 animate-pulse bg-slate-100" />
      ) : (
        <div className="space-y-8">
          {blocks.map((b) => (
            <section key={b.child.id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-violet-700" aria-hidden />
                  <h2 className="text-lg font-semibold text-slate-900">
                    {b.child.fullName}
                  </h2>
                </div>
                <Link
                  href={`/parent/child/${b.child.id}`}
                  className="text-sm font-medium text-brand-700 hover:text-brand-800"
                >
                  Hap profilin e plotë{" "}
                  <ArrowRight className="inline h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <PredictiveChart forecast={b.forecast} />
                <RiskPanel
                  child={b.child}
                  breakdown={b.breakdown}
                  alerts={b.alerts}
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
