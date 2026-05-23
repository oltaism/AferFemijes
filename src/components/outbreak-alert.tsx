"use client";

import { AlertOctagon, Megaphone, ShieldAlert } from "lucide-react";
import { OutbreakAlert, outbreakSeverityColor } from "@/lib/outbreak";
import { cn } from "@/lib/utils";

const SEVERITY_LABELS: Record<OutbreakAlert["severity"], string> = {
  urgent: "urgjent",
  high: "i lartë",
  elevated: "i ngritur",
  watch: "monitorim",
};

export function OutbreakAlertCard({ alert }: { alert: OutbreakAlert }) {
  const c = outbreakSeverityColor[alert.severity];
  const Icon =
    alert.severity === "urgent" || alert.severity === "high"
      ? AlertOctagon
      : ShieldAlert;

  return (
    <article
      className={cn(
        "card flex flex-col gap-3 p-4 ring-1 ring-inset",
        c.ring,
      )}
    >
      <header className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            c.chip,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-slate-900">{alert.headline}</h4>
            <span className={cn("chip uppercase tracking-wide", c.chip)}>
              {SEVERITY_LABELS[alert.severity]}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600">{alert.detail}</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Metric label="Mbulimi" value={`${alert.coveragePercent}%`} tone="bad" />
        <Metric
          label="Në rrezik"
          value={`~${alert.childrenAtRisk}`}
          tone="warn"
        />
        <Metric label="Vaksina" value={alert.vaccine} tone="info" />
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
        <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />
        <span>
          <strong>Veprim:</strong> {alert.recommendedAction}
        </span>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "warn" | "bad" | "info";
}) {
  const tones = {
    warn: "bg-amber-50 text-amber-700",
    bad: "bg-rose-50 text-rose-700",
    info: "bg-sky-50 text-sky-700",
  };
  return (
    <div className={cn("rounded-lg px-2 py-1.5", tones[tone])}>
      <div className="text-[10px] font-medium uppercase tracking-wide opacity-70">
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
