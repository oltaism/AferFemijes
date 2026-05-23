"use client";

import { AlertTriangle, ArrowRight, Brain } from "lucide-react";
import { Child, RiskAlert } from "@/lib/types";
import { PriorityChip } from "./status-chip";
import { RiskBar } from "./risk-bar";
import { RiskBreakdown } from "@/lib/risk";
import { AIExplanation } from "./ai-explanation";
import { ActionButtons } from "./action-buttons";

const ROLE_LABELS: Record<string, string> = {
  parent: "Prind",
  nurse: "Infermier/e",
  doctor: "Mjek",
  institution: "Institucion",
  pediatrician: "Pediatër",
};
import { explainAlert } from "@/lib/predictive";

export function RiskPanel({
  child,
  breakdown,
  alerts,
  variant = "parent",
  showHeader = true,
}: {
  child: Child;
  breakdown: RiskBreakdown;
  alerts: RiskAlert[];
  variant?: "parent" | "provider";
  showHeader?: boolean;
}) {
  return (
    <div className={showHeader ? "card space-y-4 p-5" : "space-y-4"}>
      {showHeader ? (
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200">
              <Brain className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold text-slate-900">Paralajmërim nga AI</h3>
              <p className="text-xs text-slate-500">
                Sinjale për {child.fullName} · me shpjegim.
              </p>
            </div>
          </div>
        </header>
      ) : (
        <p className="text-sm font-medium text-slate-700">
          Fokus: <span className="text-slate-900">{child.fullName}</span>
        </p>
      )}

      <RiskBar breakdown={breakdown} />

      {breakdown.reasons.length > 0 ? (
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <div className="mb-1 font-medium text-slate-700">
            Faktorët:
          </div>
          <ul className="space-y-1">
            {breakdown.reasons.map((r) => (
              <li key={r.label} className="flex items-center justify-between">
                <span>{r.label}</span>
                <span className="font-medium text-slate-700">+{r.points}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">Alarme aktive</h4>
        {alerts.length === 0 ? (
          <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200">
            Asnjë alarm për këtë fëmijë.
          </div>
        ) : (
          <ul className="space-y-3">
            {alerts.map((a) => {
              const explanation = explainAlert(a, child);
              return (
                <li
                  key={a.id}
                  className="space-y-3 rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                      <div>
                        <div className="font-medium text-slate-900">
                          {a.title}
                        </div>
                        <p className="mt-0.5 text-sm text-slate-600">
                          {a.explanation}
                        </p>
                      </div>
                    </div>
                    <PriorityChip priority={a.priority} />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    <span>{a.recommendedAction}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {a.responsible.map((r) => (
                      <span
                        key={r}
                        className="chip bg-slate-100 text-slate-700 ring-slate-200"
                      >
                        {ROLE_LABELS[r] ?? r}
                      </span>
                    ))}
                  </div>

                  <AIExplanation facts={explanation} />

                  <ActionButtons
                    alertId={a.id}
                    childId={child.id}
                    variant={variant}
                    compact
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-slate-500">
        AI nuk diagnozon — vetëm kujdes parandalues.
      </p>
    </div>
  );
}
